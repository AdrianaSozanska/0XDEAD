/* Terminal mini-game "Розслідування" (investigate), triggered by the
   terminal `game` command. Three-stage sequential investigation:
   stage 1 unlocks stage 2 via `connect`, stage 2 unlocks stage 3 via
   `decrypt`, stage 3 ends the game by opening the final file.
   All files (across all three stages) are merged into one lookup —
   visibility is controlled purely by whether a file's id is present in
   gameState.unlockedFiles, not by any "locked" flag on the file itself. */

const GAME_FILES = {
  intro: {
    filename: "readme.txt",
    content_ua: `
СИСТЕМА: фрагмент витоку отримано.
Марк мертвий. Офіційна причина невідома.
У тебе є доступ до частини його архіву.
Введи 'evidence', щоб побачити, що вдалося відновити.
    `.trim()
  },
  transfer_log: {
    filename: "transfer_log",
    content_ua: `
ДАТА         КОД_РАХУНКУ   СУМА          СТАТУС
2021-11-02   TRX-4471      100 000 USD   підтверджено
2021-11-09   TRX-4471      12 500 USD    СКАСОВАНО
2021-11-13   TRX-9902      0 USD         помилка: рахунок закрито
2021-11-15   —             —             ОСТАННЯ АКТИВНІСТЬ: н/д
    `.trim(),
    table: {
      columns: ["ДАТА", "КОД_РАХУНКУ", "СУМА", "СТАТУС"],
      rows: [
        { cells: ["2021-11-02", "TRX-4471", "100 000 USD", "підтверджено"], flagged: false },
        { cells: ["2021-11-09", "TRX-4471", "12 500 USD", "СКАСОВАНО"], flagged: true },
        { cells: ["2021-11-13", "TRX-9902", "0 USD", "помилка: рахунок закрито"], flagged: true },
        { cells: ["2021-11-15", "—", "—", "ОСТАННЯ АКТИВНІСТЬ: н/д"], flagged: false }
      ]
    }
  },
  ledger_fragment: {
    filename: "ledger_fragment",
    content_ua: `
[Відновлено частково, 4 з 11 рядків]

ДАТА        КОД_КЛІЄНТА   СУМА          СТАТУС
2021-11-01  TRX-4471      100 000 USD   очищено
2021-11-02  TRX-2214      8 300 USD     в очікуванні
2021-11-09  TRX-4471      12 500 USD    ПОЗНАЧЕНО
2021-11-13  TRX-9902      —             рахунок закрито вручну

Примітка в комірці біля TRX-4471: "перевірити ще раз. він знає."
    `.trim(),
    table: {
      note: "[Відновлено частково, 4 з 11 рядків]",
      columns: ["ДАТА", "КОД_КЛІЄНТА", "СУМА", "СТАТУС"],
      rows: [
        { cells: ["2021-11-01", "TRX-4471", "100 000 USD", "очищено"], flagged: false },
        { cells: ["2021-11-02", "TRX-2214", "8 300 USD", "в очікуванні"], flagged: false },
        { cells: ["2021-11-09", "TRX-4471", "12 500 USD", "ПОЗНАЧЕНО"], flagged: true },
        { cells: ["2021-11-13", "TRX-9902", "—", "рахунок закрито вручну"], flagged: true }
      ],
      footnote: "Примітка в комірці біля TRX-4471: «перевірити ще раз. він знає.»"
    }
  },
  mark_ashln_chat: {
    filename: "mark_ashln_chat",
    content_ua: `
[caterpillar99]: може таки буде краще якщо ти підеш з групи
[caterpillar99]: на деякий час
[ashln]: це через ту атаку?
[caterpillar99]: зустрінемося поясню
[caterpillar99]: не зараз
[ashln]: вадим не погодиться
[caterpillar99]: але антон так
[ashln]: а ти?
[caterpillar99]: зі мною все буде окей
[caterpillar99]: піду з тобою
[caterpillar99]: тільки не кажи їм що то я тобі сказав
[ashln]: окей

[СИСТЕМА]: у метаданих файлу знайдено прихований рядок: код доступу AB99
    `.trim(),
    chat: {
      participants: "ashln, caterpillar99",
      rightAlign: "ashln",
      messages: [
        { from: "caterpillar99", time: "23:12", text: "може таки буде краще якщо ти підеш з групи" },
        { from: "caterpillar99", time: "23:12", text: "на деякий час" },
        { from: "ashln", time: "23:15", text: "це через ту атаку?" },
        { from: "caterpillar99", time: "23:19", text: "зустрінемося поясню" },
        { from: "caterpillar99", time: "23:19", text: "не зараз" },
        { from: "ashln", time: "23:20", text: "вадим не погодиться" },
        { from: "caterpillar99", time: "23:26", text: "але антон так" },
        { from: "ashln", time: "23:27", text: "а ти?" },
        { from: "caterpillar99", time: "23:34", text: "зі мною все буде окей" },
        { from: "caterpillar99", time: "23:41", text: "піду з тобою" },
        { from: "caterpillar99", time: "23:41", text: "тільки не кажи їм що то я тобі сказав" },
        { from: "ashln", time: "23:42", text: "окей" }
      ],
      footnote: "[СИСТЕМА]: у метаданих файлу знайдено прихований рядок: код доступу AB99"
    }
  },
  logs_fragment: {
    filename: "logs_fragment",
    content_ua: `
[LOG FRAGMENT — INTERCEPTED COMMUNICATION]
Source: Encrypted messenger (channel unidentified)
Decryption status: Partial
Participants: UNKNOWN_1, UNKNOWN_2
Timestamp: 2021-11-15 02:47 UTC+2

UNKNOWN_1: рахунок TRX-4471 позначили.
UNKNOWN_2: наскільки серйозно?
UNKNOWN_1: перевіряють всі нові транзакції. хтось помітив патерн.
UNKNOWN_2: хто вів рахунок?
UNKNOWN_1: caterpillar99.

[END FRAGMENT — REMAINDER CORRUPTED]
    `.trim(),
    chat: {
      meta: {
        title: "LOG FRAGMENT — INTERCEPTED COMMUNICATION",
        fields: [
          "Source: Encrypted messenger (channel unidentified)",
          "Decryption status: Partial",
          "Participants: UNKNOWN_1, UNKNOWN_2",
          "Timestamp: 2021-11-15 02:47 UTC+2"
        ]
      },
      participants: "UNKNOWN_1, UNKNOWN_2",
      rightAlign: "UNKNOWN_2",
      messages: [
        { from: "UNKNOWN_1", text: "рахунок TRX-4471 позначили." },
        { from: "UNKNOWN_2", text: "наскільки серйозно?" },
        { from: "UNKNOWN_1", text: "перевіряють всі нові транзакції. хтось помітив патерн." },
        { from: "UNKNOWN_2", text: "хто вів рахунок?" },
        { from: "UNKNOWN_1", text: "caterpillar99." }
      ],
      footnote: "[END FRAGMENT — REMAINDER CORRUPTED]"
    }
  },
  final_note: {
    filename: "final_note",
    content_ua: `
[ВІДНОВЛЕНО ЧАСТКОВО]

...остання нотатка Марка, знайдена в чернетках, не надіслана нікому.

"я знаю, що ти не це мала на увазі. знаю, що вирвалося. але якщо ти це колись прочитаєш, то значить, що вони перемогли. не дай їм перемогти тебе. памʼятай хто ти ashln."

СИСТЕМА: файл пошкоджено далі цього рядка. Відновлення неможливе.
    `.trim(),
    glitch: {
      label: "ВІДНОВЛЕНО ЧАСТКОВО",
      paragraphs: [
        "...остання нотатка Марка, знайдена в чернетках, не надіслана нікому.",
        "«я знаю, що ти не це мала на увазі. знаю, що вирвалося. але якщо ти це колись прочитаєш, то значить, що вони перемогли. не дай їм перемогти тебе. памʼятай хто ти ashln.»"
      ],
      systemNote: "СИСТЕМА: файл пошкоджено далі цього рядка. Відновлення неможливе.",
      errors: [
        "СИГНАЛ ВТРАЧЕНО",
        "ПОМИЛКА РОЗШИФРУВАННЯ",
        "З'ЄДНАННЯ НЕСТАБІЛЬНЕ",
        "ВІДНОВЛЕННЯ ПЕРЕРВАНО",
        "ПАКЕТИ ВТРАЧЕНО: 47%"
      ]
    }
  }
};

const GAME_INITIAL_UNLOCKED = ["transfer_log", "ledger_fragment"];

const GAME_STAGE1_SOLUTION = {
  requiredCommand: "connect trx-4471 trx-4471",
  successMessage_ua: "Код TRX-4471 з'являється в обох документах — один переказ позначили і одразу скасували. Хтось намагався його приховати.\n\n[СТАТУС]: доступ до нових файлів відкрито.\n\nВведи 'evidence', щоб побачити, що вдалося відновити.\nВведи 'game-help', щоб побачити список команд гри.",
  failMessage_ua: "Ці коди не пов'язані. Перевір ledger_fragment і transfer_log ще раз.",
  unlocks: ["mark_ashln_chat", "logs_fragment"],
  advanceToStage: 2
};

const GAME_STAGE2_SOLUTION = {
  requiredCommand: "decrypt final_note ab99",
  successMessage_ua: "[final_note розблоковано]\n\nВведи 'evidence', щоб побачити, що вдалося відновити.\nВведи 'game-help', щоб побачити список команд гри.",
  failMessage_ua: "Невірний код доступу.",
  unlocks: ["final_note"],
  advanceToStage: 3
};

const GAME_HINTS = {
  1: [
    "Придивись до кодів рахунків — один і той самий з'являється двічі.",
    "TRX-4471 варто зіставити між ledger_fragment і transfer_log.",
    "Спробуй: connect TRX-4471 TRX-4471"
  ],
  2: [
    "Прочитай уважно mark_ashln_chat — там є щось більше, ніж просто розмова.",
    "Перевір метадані файлу переписки, не лише текст.",
    "Код: AB99 — використай його з командою decrypt final_note AB99"
  ]
};

const GAME_ENDING_MESSAGE_UA = `
Хтось знав про рахунок TRX-4471
задовго до того, як Марк зрозумів, що насправді відбувається.

Але глибше за гроші — лишається одне питання без відповіді:
Що саме сталося 28.10.2021.

[СТАТИСТИКА СЕАНСУ]
Використано підказок: {hintsUsed}

Повна історія — в 0xDEAD. Вже скоро.
`.trim();
