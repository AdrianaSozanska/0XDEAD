/* Evidence lockers for the Classified Archive section — a police cold
   storage, not a puzzle: nothing is locked, nothing needs a code, and
   there's no order to open them in. Each entry has a `type` that picks
   which bespoke template renderArchiveModal() builds for it in main.js
   (see the switch there) — `redacted` gets the blackout treatment reused
   from the dossier modal (see `.redaction` in style.css), everything else
   gets its own in-universe document look.
   Placeholder/lore content — swap in real world-building copy later. */
const ARCHIVE_FILES = [
  {
    id: "red-notice",
    tag: "ДОК. №001",
    label: "NOTICE OF CYBERCRIME GROUP ACTIVITY",
    icon: "🛡",
    type: "notice",
    notice: {
      reference: "№ 2021/778-UA",
      classification: "RESTRICTED — LAW ENFORCEMENT USE ONLY",
      dateOfIssue: "Грудень 2021",
      issuingAuthority: "INTERPOL",
      group: {
        name: "«AZ-5»",
        activityType: "Кібератаки на фінансові установи та медичні заклади",
        geography: "Канада, Бразилія, [та інші країни]",
        status: "Активне угруповання",
        note: "Угруповання перебуває в розшуку у понад 30 країнах світу"
      },
      members: [
        { alias: "xaerith", role: "роль встановлюється" },
        { alias: "rad0n", role: "координація діяльності групи" },
        { alias: "kolOFF", role: "роль встановлюється" }
      ],
      modusOperandi: [
        "Угруповання діє за моделлю Ransomware-as-a-Service (RaaS), надаючи власне шкідливе програмне забезпечення в користування афілійованим виконавцям в обмін на частку викупу. Типова схема атаки включає початкове проникнення через фішингові розсилки, компрометовані облікові дані або вразливості в публічно доступних сервісах, після чого зловмисники закріплюються в мережі жертви та здійснюють горизонтальне переміщення для отримання доступу до критичних систем.",
        "Перед розгортанням програми-шифрувальника угруповання здійснює викрадення конфіденційних даних жертви (клієнтські бази, фінансова звітність, медичні картки пацієнтів), що використовується як важіль подвійного тиску: у разі відмови від сплати викупу дані оприлюднюються або продаються на тіньових форумах. Атаки на медичні заклади фіксувалися з особливо високим рівнем ескалації тиску через критичність систем для життєзабезпечення пацієнтів.",
        "Отримані кошти проходять через багатоступеневу систему легалізації з використанням криптовалютних міксерів, мережі підставних ФОП та транзитних рахунків у кількох юрисдикціях."
      ],
      charges: [
        "ст. 361 ККУ — несанкціоноване втручання в роботу комп'ютерних систем",
        "ст. 361-1 ККУ — створення шкідливого програмного забезпечення",
        "ст. 209 ККУ — легалізація (відмивання) майна, одержаного злочинним шляхом"
      ],
      threat: {
        level: "High",
        recommendation: "не встановлювати контакт самостійно; інформацію передавати до найближчого підрозділу NCB/кіберполіції"
      },
      distribution: "Europol, NCB Interpol (країни-члени), національні кіберполіції країн-учасниць",
      disclaimer: "Інформація носить оперативний характер і підлягає перевірці. Розповсюдження документа третім особам заборонено."
    }
  },
  {
    id: "firewall-log",
    tag: "ДОК. №002",
    label: "Мережевий журнал (FortiGate)",
    icon: "🧱",
    type: "firewall",
    firewall: {
      device: "FGT-HOSPITAL-TORONTO",
      lines: [
        "date=2021-10-28 time=15:30:00 devname=\"FGT-HOSPITAL-TORONTO\" devid=\"FG100E3919xxxxx\" logid=\"0001000014\" type=\"traffic\" subtype=\"forward\" level=\"warning\" srcip=185.220.101.47 srcport=44192 srccountry=\"Netherlands\" dstip=192.168.14.15 dstport=3389 dstcountry=\"Canada\" action=\"deny\" policyid=12 service=\"RDP\" attack=\"Suspicious.RDP.BruteForce\" msg=\"Multiple failed authentication attempts detected\"",
        "",
        "date=2021-10-28 time=15:49:35 devname=\"FGT-HOSPITAL-TORONTO\" devid=\"FG100E3919xxxxx\"",
        "logid=\"0419016384\" type=\"utm\" subtype=\"ips\" level=\"critical\"",
        "srcip=185.220.101.47 dstip=192.168.14.15 dstport=445",
        "attack=\"MS.SMB.Server.SMBv1.Remote.Code.Execution\"",
        "severity=\"critical\" action=\"blocked\"",
        "msg=\"Exploit attempt matching known ransomware delivery pattern\"",
        "",
        "date=2021-10-28 time=16:15:16 devname=\"FGT-HOSPITAL-TORONTO\" devid=\"FG100E3919xxxxx\"",
        "logid=\"0000000013\" type=\"event\" subtype=\"system\" level=\"alert\"",
        "msg=\"Unusual outbound traffic volume detected: 14.2GB in 6 minutes\"",
        "srcip=192.168.14.15 dstip=94.142.xxx.xxx dstcountry=\"Romania\"",
        "action=\"flagged\" comment=\"Possible data exfiltration prior to encryption event\"",
        "",
        "date=2021-10-28 time=16:19:44 devname=\"FGT-HOSPITAL-TORONTO\" devid=\"FG100E3919xxxxx\"",
        "logid=\"0419016391\" type=\"utm\" subtype=\"virus\" level=\"critical\"",
        "filename=\"svchost_update.exe\"",
        "virus=\"W32/Filecoder.AZ5!tr.ransom\"",
        "action=\"quarantine_failed\"",
        "msg=\"File already executed prior to signature update — quarantine unsuccessful\""
      ]
    }
  },
  {
    id: "chat-log",
    tag: "ДОК. №003",
    label: "Листування: ashln — caterpillar99",
    icon: "💬",
    type: "chat",
    chat: {
      participants: "ashln, caterpillar99",
      messages: [
        { from: "caterpillar99", time: "23:38", text: "чому не спиш" },
        { from: "ashln", time: "23:38", text: "чому ти не спиш :)" },
        { from: "caterpillar99", time: "23:39", text: "якраз лягаю :)" },
        { from: "caterpillar99", time: "23:41", text: "stern питав про тебе. знову." },
        { from: "ashln", time: "23:42", text: "nope" },
        { from: "caterpillar99", time: "23:44", text: "тобі потрібна робота. тільки один раз. і якщо не хочеш більше — можеш піти." },
        { from: "caterpillar99", time: "23:47", text: "аліса?" },
        { from: "ashln", time: "23:52", text: "подумаю" },
        { from: "caterpillar99", time: "23:53", text: "не відповідай нікому крім мене найближчі кілька днів, добре?" },
        { from: "ashln", time: "23:54", text: "марк, ти мене лякаєш" },
        { from: "ashln", time: "00:14", text: "ти тут?" }
      ]
    }
  },
  {
    id: "alisa-mugshot",
    tag: "ДОК. №004",
    label: "Протокол затримання",
    icon: "📸",
    type: "mugshot",
    mugshot: {
      photo: "assets/img/АлісаАрешт.jpeg",
      name: "Аліса [REDACTED]",
      dob: "[REDACTED]",
      charge: "ст. 309 ч. 1 ККУ — незаконне зберігання наркотичних засобів без мети збуту (у невеликих розмірах)",
      bookingNo: "KY-2019-04471",
      department: "Слідчий ізолятор №13, м. Київ",
      note: "Перше затримання. Відмовилась від адвоката. Відмовилась від показань."
    }
  },
  {
    id: "redacted-file",
    tag: "ДОК. №005",
    label: "[REDACTED]",
    icon: "■",
    type: "redacted",
    redactedNote: "ВМІСТ ВИЛУЧЕНО ЗА РІШЕННЯМ СЛІДЧОГО"
  },
  {
    id: "news-article",
    tag: "ДОК. №006",
    label: "Публікація у ЗМІ",
    icon: "📰",
    type: "news",
    news: {
      outlet: "СТОЛИЧНИЙ ВІСНИК",
      section: "Кримінал",
      date: "20 жовтня 2024",
      headline: "Під мостом Патона знайдено тіло чоловіка",
      byline: "Редакція",
      paragraphs: [
        "Тіло 27-річного М. Гуменюка виявив в неділю вранці мешканць поблизьких будинків, що прогулювався з собакою. За попередніми даними поліції, ознак насильницької смерті на місці не виявлено, проте слідство не виключає жодної версії.",
        "За словами знайомих, чоловік працював фінансовим консультантом і \"тримався осторонь чужих справ\". Слідчі вже опитали кількох осіб з його оточення.",
        "Причина смерті встановлюється. У поліції повідомили, що результати експертизи очікуються найближчим часом, а розслідування триває."
      ]
    }
  }
];
