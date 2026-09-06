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
    id: "alisa-mugshot",
    tag: "ДОК. №002",
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
    tag: "ДОК. №006",
    label: "[REDACTED]",
    icon: "■",
    type: "redacted",
    redactedNote: "ВМІСТ ВИЛУЧЕНО ЗА РІШЕННЯМ СЛІДЧОГО"
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
        { from: "caterpillar99", time: "23:41", text: "не спи, є новини" },
        { from: "caterpillar99", time: "23:41", text: "Куратор питав про тебе. знову." },
        { from: "ashln", time: "23:42", text: "скажи що я закінчила з цим два роки тому" },
        { from: "caterpillar99", time: "23:44", text: "я сказав. він не повірив" },
        { from: "caterpillar99", time: "23:44", text: "не відповідай нікому крім мене найближчі кілька днів, добре?" },
        { from: "ashln", time: "23:45", text: "марк, ти мене лякаєш" },
        { from: "caterpillar99", time: "23:47", text: "просто довірся. так само як тоді, до AZ-5" },
        { from: "ashln", time: "23:52", text: "добре. довіряю" }
      ]
    }
  },
  {
    id: "news-article",
    tag: "ДОК. №004",
    label: "Публікація у ЗМІ",
    icon: "📰",
    type: "news",
    news: {
      outlet: "СТОЛИЧНИЙ ВІСНИК",
      section: "Кримінал",
      date: "20 жовтня 2024",
      headline: "Під мостом Патона за нез'ясованих обставин знайдено тіло чоловіка",
      byline: "Редакція",
      paragraphs: [
        "Тіло 27-річного М. Гуменюка виявив в неділю вранці мешканць поблизьких будинків, що прогулювався з собакою. За попередніми даними поліції, ознак насильницької смерті на місці не виявлено, проте слідство не виключає жодної версії.",
        "За словами знайомих, чоловік працював фінансовим консультантом і \"тримався осторонь чужих справ\". Слідчі вже опитали кількох осіб з його оточення.",
        "Причина смерті встановлюється. У поліції повідомили, що результати експертизи очікуються найближчим часом, а розслідування триває."
      ]
    }
  },
  {
    id: "firewall-log",
    tag: "ДОК. №005",
    label: "Мережевий журнал (FortiGate)",
    icon: "🧱",
    type: "firewall",
    firewall: {
      device: "FGT-EDGE-03",
      lines: [
        "date=2024-11-09 time=03:14:02 devname=FGT-EDGE-03 logid=0000000013 type=traffic subtype=forward level=notice srcip=10.20.4.71 srcport=51422 dstip=185.220.101.7 dstport=443 proto=6 action=accept service=HTTPS policyid=12 sessionid=884210",
        "date=2024-11-09 time=03:14:19 devname=FGT-EDGE-03 logid=0000000013 type=traffic subtype=forward level=warning srcip=10.20.4.71 srcport=51430 dstip=185.220.101.7 dstport=8443 proto=6 action=deny service=tcp/8443 policyid=12 utmaction=block crscore=87 crlevel=critical",
        "date=2024-11-09 time=03:15:44 devname=FGT-EDGE-03 logid=0000000013 type=traffic subtype=forward level=notice srcip=10.20.4.90 srcport=49102 dstip=45.83.191.14 dstport=22 proto=6 action=accept service=SSH policyid=07 sessionid=884233",
        "date=2024-11-09 time=03:22:01 devname=FGT-EDGE-03 logid=0000000013 type=traffic subtype=forward level=warning srcip=10.20.4.12 srcport=60011 dstip=45.83.191.14 dstport=3389 proto=6 action=deny service=RDP policyid=07 utmaction=block crscore=94 crlevel=critical",
        "date=2024-11-09 time=03:22:03 devname=FGT-EDGE-03 logid=0000000013 type=traffic subtype=forward level=warning srcip=10.20.4.12 srcport=60012 dstip=45.83.191.14 dstport=3389 proto=6 action=deny service=RDP policyid=07 utmaction=block crscore=94 crlevel=critical",
        "date=2024-11-09 time=03:41:57 devname=FGT-EDGE-03 logid=0000000013 type=traffic subtype=forward level=notice srcip=10.20.4.71 srcport=51502 dstip=194.36.190.2 dstport=443 proto=6 action=accept service=HTTPS policyid=12 sessionid=884299",
        "date=2024-11-09 time=03:58:30 devname=FGT-EDGE-03 logid=0000000013 type=traffic subtype=forward level=critical srcip=10.20.4.90 srcport=51988 dstip=194.36.190.2 dstport=4444 proto=6 action=deny service=tcp/4444 policyid=12 utmaction=block crscore=99 crlevel=critical attack=\"Malicious.C2.Beacon\""
      ]
    }
  }
];
