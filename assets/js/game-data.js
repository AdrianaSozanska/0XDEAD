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
    filename: "transfer_log.csv",
    content_ua: `
ДАТА         КОД_РАХУНКУ   СУМА         СТАТУС
2024-11-02   TRX-4471      47 000 USD   підтверджено
2024-11-09   TRX-4471      12 500 USD   СКАСОВАНО
2024-11-13   TRX-9902      0 USD        помилка: рахунок закрито
2024-11-15   —             —            ОСТАННЯ АКТИВНІСТЬ: н/д
    `.trim(),
    table: {
      columns: ["ДАТА", "КОД_РАХУНКУ", "СУМА", "СТАТУС"],
      rows: [
        { cells: ["2024-11-02", "TRX-4471", "47 000 USD", "підтверджено"], flagged: false },
        { cells: ["2024-11-09", "TRX-4471", "12 500 USD", "СКАСОВАНО"], flagged: true },
        { cells: ["2024-11-13", "TRX-9902", "0 USD", "помилка: рахунок закрито"], flagged: true },
        { cells: ["2024-11-15", "—", "—", "ОСТАННЯ АКТИВНІСТЬ: н/д"], flagged: false }
      ]
    }
  },
  ledger_fragment: {
    filename: "ledger_fragment.xlsx",
    content_ua: `
[Відновлено частково, 4 з 11 рядків]

ДАТА        КОД_КЛІЄНТА   СУМА         СТАТУС
2024-10-28  TRX-4471      47 000 USD   очищено
2024-11-01  TRX-2214      8 300 USD    в очікуванні
2024-11-09  TRX-4471      12 500 USD   ПОЗНАЧЕНО
2024-11-14  TRX-9902      —            рахунок закрито вручну

Примітка в комірці біля TRX-4471: "перевірити ще раз. він знає."
    `.trim(),
    table: {
      note: "[Відновлено частково, 4 з 11 рядків]",
      columns: ["ДАТА", "КОД_КЛІЄНТА", "СУМА", "СТАТУС"],
      rows: [
        { cells: ["2024-10-28", "TRX-4471", "47 000 USD", "очищено"], flagged: false },
        { cells: ["2024-11-01", "TRX-2214", "8 300 USD", "в очікуванні"], flagged: false },
        { cells: ["2024-11-09", "TRX-4471", "12 500 USD", "ПОЗНАЧЕНО"], flagged: true },
        { cells: ["2024-11-14", "TRX-9902", "—", "рахунок закрито вручну"], flagged: true }
      ],
      footnote: "Примітка в комірці біля TRX-4471: «перевірити ще раз. він знає.»"
    }
  },
  mark_ashln_chat: {
    filename: "mark_ashln_chat.txt",
    content_ua: `
[caterpillar99]: тримайся подалі від TRX-4471. Просто довірся мені.
[ashln]: ти ніколи раніше не просив мене не лізти. що відбувається?
[caterpillar99]: колись поясню. не зараз.
[caterpillar99]: ти єдина людина тут, яка знала мене ще до всього цього.
[ashln]: тому я і хвилююсь.
[caterpillar99]: зі мною все буде добре. а якщо ні — просто пам'ятай, що я завжди прикривав тебе. завжди.

[СИСТЕМА]: у метаданих файлу знайдено прихований рядок: код доступу AB99
    `.trim()
  },
  logs_fragment: {
    filename: "logs_fragment.txt",
    content_ua: `
[невідомий1]: він почав ставити забагато питань про рахунки.
[невідомий2]: то нехай перестане.
[невідомий1]: а якщо не перестане?
[невідомий2]: тоді питання вирішиться само.
    `.trim()
  },
  final_note: {
    filename: "final_note.enc",
    content_ua: `
[ВІДНОВЛЕНО ЧАСТКОВО]

...остання нотатка Марка, знайдена в чернетках, не надіслана нікому.

"Якщо ти це читаєш — значить, я не встиг сказати тобі особисто.
Я захищав тебе довше, ніж ти думаєш. Задовго до AZ-5.
Ти вже й сама здогадалась чому. Просто ще не пам'ятаєш звідки."

СИСТЕМА: файл пошкоджено далі цього рядка. Відновлення неможливе.
    `.trim()
  }
};

const GAME_INITIAL_UNLOCKED = ["transfer_log", "ledger_fragment"];

const GAME_STAGE1_SOLUTION = {
  requiredCommand: "connect trx-4471 trx-4471",
  successMessage_ua: "Код TRX-4471 з'являється в обох документах — один переказ позначили і одразу скасували. Хтось намагався його приховати.\n\n[СТАТУС]: доступ до нових файлів відкрито.",
  failMessage_ua: "Ці коди не пов'язані. Перевір ledger_fragment і transfer_log ще раз.",
  unlocks: ["mark_ashln_chat", "logs_fragment"],
  advanceToStage: 2
};

const GAME_STAGE2_SOLUTION = {
  requiredCommand: "decrypt final_note ab99",
  successMessage_ua: "[final_note.enc розблоковано]",
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
    "Прочитай уважно mark_ashln_chat.txt — там є щось більше, ніж просто розмова.",
    "Перевір метадані файлу переписки, не лише текст.",
    "Код: AB99 — використай його з командою decrypt final_note AB99"
  ]
};

const GAME_ENDING_MESSAGE_UA = `
Це не була випадковість. Хтось знав про рахунок TRX-4471
задовго до того, як Марк почав ставити питання.

Але глибше за гроші — лишається одне питання без відповіді:
що саме зв'язувало Марка та Алісу задовго до AZ-5?

[СТАТИСТИКА СЕАНСУ]
Використано підказок: {hintsUsed}

Повна історія — в 0xDEAD. Вже скоро.
`.trim();
