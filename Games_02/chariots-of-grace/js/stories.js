// Chariots of Grace — story & choice data.
// Story summaries are written in our own words; short verse quotes are from the
// King James Version (public domain). Each commandment chapter pairs a Bible
// story with a modern life choice. kind: "righteous" | "compromise" | "sin".

window.COMMANDMENTS = [
  { n: 1, short: "No other gods", text: "Thou shalt have no other gods before me.", ref: "Exodus 20:3", meaning: "Put God first — above popularity, money, or fear." },
  { n: 2, short: "No idols", text: "Thou shalt not make unto thee any graven image.", ref: "Exodus 20:4", meaning: "Don't let any created thing become what you worship." },
  { n: 3, short: "Honor God's name", text: "Thou shalt not take the name of the LORD thy God in vain.", ref: "Exodus 20:7", meaning: "Speak of God with respect, and keep the promises you make in His name." },
  { n: 4, short: "Keep the Sabbath", text: "Remember the sabbath day, to keep it holy.", ref: "Exodus 20:8", meaning: "Make time to rest, worship, and trust that God provides." },
  { n: 5, short: "Honor your parents", text: "Honour thy father and thy mother.", ref: "Exodus 20:12", meaning: "Respect and care for the family who cared for you." },
  { n: 6, short: "Do not murder", text: "Thou shalt not kill.", ref: "Exodus 20:13", meaning: "Treasure every life. Jesus taught that this begins with how we handle anger." },
  { n: 7, short: "Be faithful", text: "Thou shalt not commit adultery.", ref: "Exodus 20:14", meaning: "Be loyal in marriage and faithful to the commitments you make." },
  { n: 8, short: "Do not steal", text: "Thou shalt not steal.", ref: "Exodus 20:15", meaning: "Be honest with what belongs to others — and make it right when you aren't." },
  { n: 9, short: "Do not lie", text: "Thou shalt not bear false witness against thy neighbour.", ref: "Exodus 20:16", meaning: "Tell the truth, especially when someone else could be hurt by a lie." },
  { n: 10, short: "Do not covet", text: "Thou shalt not covet.", ref: "Exodus 20:17", meaning: "Be content and grateful instead of craving what others have." }
];

// Journey stops, in order. type: "chapter" | "forgive" | "temple"
window.JOURNEY = [
  {
    type: "chapter", cmd: 1, place: "Babylon",
    title: "The Fiery Furnace",
    ref: "Daniel 3",
    story: "King Nebuchadnezzar set up a giant golden statue and ordered everyone to bow when the music played. Shadrach, Meshach and Abednego refused — they would worship God alone. Thrown into a blazing furnace, they walked unharmed, and a fourth figure was seen walking with them in the fire.",
    verse: { text: "Our God whom we serve is able to deliver us from the burning fiery furnace.", ref: "Daniel 3:17" },
    prompt: "Your new friend group has a rule: Sunday mornings are for the big team practice, and anyone who skips church to join is \"really one of us.\" The captain asks you to choose — the team, or your faith community.",
    choices: [
      { kind: "righteous", text: "Kindly explain that God comes first, and offer to train extra on Saturday instead.", outcome: "Some teammates roll their eyes — but the captain respects your honesty and moves practice to the afternoon. Like the three in the furnace, standing firm didn't burn you.", virtue: 10, faith: 10, talents: 4 },
      { kind: "compromise", text: "Go to practice this week, and promise yourself you'll figure it out later.", outcome: "Nothing terrible happens — but \"later\" keeps getting pushed back. Small compromises add up.", virtue: 0, faith: -3, talents: 1 },
      { kind: "sin", text: "Drop church for good. Fitting in matters more right now.", outcome: "You fit in, but something feels hollow. Popularity made a poor god.", virtue: -10, faith: -10, talents: 0 }
    ]
  },
  {
    type: "chapter", cmd: 2, place: "Mount Sinai",
    title: "The Golden Calf",
    ref: "Exodus 32",
    story: "While Moses was on the mountain receiving God's law, the people grew impatient. They melted their gold earrings into a calf and danced around it, calling it their god. Moses came down, broke the stone tablets, and later pleaded with God to forgive them.",
    verse: { text: "They have made them a molten calf, and have worshipped it.", ref: "Exodus 32:8" },
    prompt: "A new phone game has taken over your life. You check it before you pray, during meals, and late into the night. Your little sister asks why you never play with her anymore.",
    choices: [
      { kind: "righteous", text: "Delete the game for a month and spend that time with God and your sister.", outcome: "It's hard for three days — then it feels like freedom. Your sister draws you a picture that says \"best day ever.\"", virtue: 10, faith: 8, talents: 4 },
      { kind: "compromise", text: "Set a timer and try to play less.", outcome: "You cut back a little. The calf is smaller — but it's still on the altar.", virtue: 3, faith: 0, talents: 2 },
      { kind: "sin", text: "Tell her to go away. You're about to reach the next level.", outcome: "You reach the next level. She stops asking. Gold earrings, melted for something that can't love you back.", virtue: -10, faith: -8, talents: 0 }
    ]
  },
  {
    type: "chapter", cmd: 3, place: "Shiloh",
    title: "Hannah's Promise",
    ref: "1 Samuel 1",
    story: "Hannah longed for a child and prayed so earnestly at the temple that the priest Eli thought she was drunk. She promised that if God gave her a son, she would dedicate him to the Lord. God answered — and Hannah kept her word, bringing young Samuel to serve at the temple.",
    verse: { text: "For this child I prayed; and the LORD hath given me my petition.", ref: "1 Samuel 1:27" },
    prompt: "You told a friend, \"I swear to God I'll help you move on Saturday.\" Saturday comes and you'd rather sleep in. Another friend jokes that \"swearing to God doesn't mean anything anyway.\"",
    choices: [
      { kind: "righteous", text: "Get up and go. When you speak in God's name, you mean it.", outcome: "Your friend is so grateful. You learn to say a simple \"yes\" and mean it — no swearing needed.", virtue: 10, faith: 8, talents: 4 },
      { kind: "compromise", text: "Show up two hours late with an excuse.", outcome: "You helped — partly. But the promise you made in God's name was bent.", virtue: 2, faith: -2, talents: 2 },
      { kind: "sin", text: "Laugh along, text \"sorry, something came up,\" and go back to bed.", outcome: "Using God's name to make an empty promise treats it as nothing. Your friend moves alone.", virtue: -10, faith: -8, talents: 0 }
    ]
  },
  {
    type: "chapter", cmd: 4, place: "The Wilderness",
    title: "Manna on the Seventh Day",
    ref: "Exodus 16",
    story: "In the desert, God fed Israel with manna — bread from heaven — every morning. On the sixth day they gathered twice as much, because on the seventh day none would fall. Some went out anyway on the Sabbath and found nothing. God was teaching them to rest and trust.",
    verse: { text: "The LORD hath given you the sabbath.", ref: "Exodus 16:29" },
    prompt: "You've worked hard all week. Your boss offers extra pay to work the whole weekend — again. You've missed worship and family dinner three weeks in a row and you're exhausted.",
    choices: [
      { kind: "righteous", text: "Say no this time. Rest, worship, and eat dinner with your family.", outcome: "You wake up Monday refreshed. Somehow the bills still get paid. Like the manna, there was enough.", virtue: 8, faith: 10, talents: 3 },
      { kind: "compromise", text: "Work Saturday but keep Sunday for rest and church.", outcome: "A reasonable balance — though your body is still asking for more rest than you're giving it.", virtue: 4, faith: 3, talents: 4 },
      { kind: "sin", text: "Take every shift. Rest is for people who aren't trying hard enough.", outcome: "More money — and more exhaustion. You went looking for manna on the seventh day and found the field empty.", virtue: -8, faith: -10, talents: 6 }
    ]
  },
  {
    type: "chapter", cmd: 5, place: "Moab",
    title: "Ruth and Naomi",
    ref: "Ruth 1",
    story: "After Naomi lost her husband and both sons, she told her daughters-in-law to go home. Ruth refused to leave her. She followed Naomi to a foreign land and worked in the fields to provide for her. God blessed Ruth's loyalty — she became the great-grandmother of King David.",
    verse: { text: "Whither thou goest, I will go.", ref: "Ruth 1:16" },
    prompt: "Your grandmother lives alone and asks if you can visit and help with groceries on Friday night. Your friends are throwing the party of the year at the same time.",
    choices: [
      { kind: "righteous", text: "Spend Friday with Grandma. She tells you stories about your family you never knew.", outcome: "She holds your hand at the door and says you made her week. Honor brings its own reward.", virtue: 10, faith: 6, talents: 4 },
      { kind: "compromise", text: "Drop the groceries off quickly, then rush to the party.", outcome: "She smiles, but you notice she had set out two teacups.", virtue: 3, faith: 1, talents: 2 },
      { kind: "sin", text: "Ignore the call and tell your parents you were \"too busy.\"", outcome: "The party was fun for a night. Grandma's teacups stayed on the table.", virtue: -10, faith: -5, talents: 0 }
    ]
  },
  {
    type: "forgive", place: "Egypt",
    title: "Joseph Forgives His Brothers",
    ref: "Genesis 45",
    story: "Joseph's jealous brothers sold him into slavery. Years later, God raised him to be ruler over Egypt. When famine drove the brothers to beg him for food, they didn't recognize him. Joseph could have taken revenge. Instead he wept, embraced them, and said God had turned their evil into good.",
    verse: { text: "Ye thought evil against me; but God meant it unto good.", ref: "Genesis 50:20" },
    prompt: "Last year a classmate spread a hurtful rumor about you. Now they come to you, embarrassed, saying they're sorry — and they need help studying for a test you've already aced.",
    choices: [
      { kind: "righteous", text: "Forgive them sincerely and help them study.", outcome: "They're stunned — and so are you, by how light you feel. \"Forgive, and ye shall be forgiven.\" (Luke 6:37)", virtue: 12, faith: 8, talents: 3, forgives: true },
      { kind: "compromise", text: "Say \"it's fine\" but keep your distance and don't help.", outcome: "The words were right, but the grudge is still sitting in your pocket.", virtue: 2, faith: 0, talents: 1 },
      { kind: "sin", text: "Refuse, and tell everyone what they did to you.", outcome: "Revenge felt sweet for an hour. Then it felt heavy.", virtue: -10, faith: -6, talents: 0 }
    ]
  },
  {
    type: "chapter", cmd: 6, place: "The Caves of En Gedi",
    title: "David Spares Saul",
    ref: "1 Samuel 24",
    story: "King Saul hunted David to kill him. One day Saul entered the very cave where David was hiding. David's men urged him to strike. Instead, David quietly cut off a corner of Saul's robe — and refused to harm the one God had anointed. He chose mercy over murder.",
    verse: { text: "Blessed are the merciful: for they shall obtain mercy.", ref: "Matthew 5:7" },
    prompt: "Someone humiliated you online in front of everyone. You've found a photo that would destroy their reputation. Jesus taught that hatred in the heart is where murder begins.",
    choices: [
      { kind: "righteous", text: "Delete the photo. Talk to them privately, or let it go and pray for them.", outcome: "Like David in the cave, you had the power to destroy — and chose mercy. Your anger cools into peace.", virtue: 12, faith: 8, talents: 4 },
      { kind: "compromise", text: "Keep the photo \"just in case,\" but don't post it.", outcome: "You didn't strike — but you're still holding the knife.", virtue: 2, faith: -2, talents: 1 },
      { kind: "sin", text: "Post it with a cruel caption.", outcome: "The comments pile up. You watch someone get crushed, and the satisfaction lasts about a minute.", virtue: -12, faith: -8, talents: 0 }
    ]
  },
  {
    type: "chapter", cmd: 7, place: "Potiphar's House",
    title: "Joseph Stays Faithful",
    ref: "Genesis 39",
    story: "As a servant in Egypt, Joseph was trusted with everything in his master Potiphar's house. Potiphar's wife repeatedly tried to tempt him to betray his master. Joseph refused — and when she grabbed him, he ran, leaving his cloak behind. He chose faithfulness even though it cost him.",
    verse: { text: "How then can I do this great wickedness, and sin against God?", ref: "Genesis 39:9" },
    prompt: "You're engaged to someone you love. At work, a charming coworker keeps flirting and invites you for \"just one drink, nobody needs to know.\"",
    choices: [
      { kind: "righteous", text: "Say clearly that you're committed, and keep things professional.", outcome: "Like Joseph leaving his cloak, you walked away clean. Your fiancé never had to wonder.", virtue: 12, faith: 6, talents: 4 },
      { kind: "compromise", text: "Decline the drink, but keep enjoying the flirting at work.", outcome: "You haven't crossed the line — but you're dancing right next to it.", virtue: 0, faith: -2, talents: 1 },
      { kind: "sin", text: "Go for the drink. What they don't know won't hurt them.", outcome: "Secrets have a way of growing. Trust, once cracked, is hard to mend.", virtue: -12, faith: -8, talents: 0 }
    ]
  },
  {
    type: "temple", place: "The Temple in Jerusalem",
    title: "The Widow's Two Coins",
    ref: "Mark 12:41–44",
    story: "Jesus sat near the temple treasury watching people give. Rich people tossed in large amounts. Then a poor widow quietly dropped in two tiny coins — all she had. Jesus told His disciples she had given more than all the others, because she gave out of her poverty, not her plenty.",
    verse: { text: "God loveth a cheerful giver.", ref: "2 Corinthians 9:7" },
    prompt: "You pass the temple offering box. How many of your talents will you give to help the poor?",
    choices: [] // generated from the player's talents at runtime
  },
  {
    type: "chapter", cmd: 8, place: "Jericho",
    title: "Zacchaeus Makes It Right",
    ref: "Luke 19",
    story: "Zacchaeus was a rich tax collector who had cheated many people. He climbed a sycamore tree just to see Jesus pass by. Jesus stopped, called him by name, and came to his house. Zacchaeus was so changed that he gave half his wealth to the poor and paid back four times what he'd stolen.",
    verse: { text: "If I have taken any thing from any man by false accusation, I restore him fourfold.", ref: "Luke 19:8" },
    prompt: "The cashier at the market accidentally gives you $20 too much in change. Nobody would ever know.",
    choices: [
      { kind: "righteous", text: "Go back and return it. The cashier's drawer would have been short.", outcome: "The cashier sighs with relief — she would have had to pay it herself. Honesty is its own kind of wealth.", virtue: 10, faith: 6, talents: 4 },
      { kind: "compromise", text: "Keep it, but drop some of it in the next charity box to feel better.", outcome: "Giving away stolen money still isn't giving. Zacchaeus paid back the people he took from.", virtue: -2, faith: 0, talents: 2 },
      { kind: "sin", text: "Pocket it. Their mistake, your gain.", outcome: "$20 richer. A little poorer inside.", virtue: -10, faith: -5, talents: 3 }
    ]
  },
  {
    type: "chapter", cmd: 9, place: "The High Priest's Courtyard",
    title: "Peter's Denial",
    ref: "Luke 22; John 21",
    story: "On the night Jesus was arrested, Peter — who had promised to die for Him — was asked three times if he knew Jesus. Three times he lied: \"I don't know Him.\" Then the rooster crowed and Peter wept bitterly. After rising from the dead, Jesus found Peter and three times asked, \"Do you love me?\" — restoring him completely.",
    verse: { text: "Simon, son of Jonas, lovest thou me?", ref: "John 21:16" },
    prompt: "You accidentally broke the class science display. The teacher thinks it was the quiet new kid, who's about to be punished.",
    choices: [
      { kind: "righteous", text: "Raise your hand and tell the truth: \"It was me. I'm sorry.\"", outcome: "The class goes silent. The teacher thanks you for your honesty — and the new kid gives you a grateful nod.", virtue: 12, faith: 6, talents: 4 },
      { kind: "compromise", text: "Stay quiet, but tell the teacher in private after class.", outcome: "You told the truth eventually — though the new kid sweated through a long, scary hour.", virtue: 4, faith: 2, talents: 2 },
      { kind: "sin", text: "Nod along when someone says, \"It was probably the new kid.\"", outcome: "An innocent kid takes the blame for you. Somewhere, a rooster crows.", virtue: -12, faith: -8, talents: 0 }
    ]
  },
  {
    type: "chapter", cmd: 10, place: "Jezreel",
    title: "Naboth's Vineyard",
    ref: "1 Kings 21",
    story: "King Ahab had a palace and riches, but he wanted his neighbor Naboth's little vineyard. When Naboth refused to sell his family's land, Ahab sulked. Queen Jezebel had Naboth falsely accused and killed so Ahab could take it. God sent the prophet Elijah to confront Ahab for what his coveting had led to.",
    verse: { text: "Be content with such things as ye have.", ref: "Hebrews 13:5" },
    prompt: "Your best friend just got the exact bike you've wanted for a year. You feel a hot wave of jealousy.",
    choices: [
      { kind: "righteous", text: "Congratulate them sincerely, and thank God for what you already have.", outcome: "They let you ride it all afternoon. Contentment turned envy into shared joy.", virtue: 10, faith: 8, talents: 4 },
      { kind: "compromise", text: "Say \"cool\" flatly and change the subject.", outcome: "No harm done — but the envy is still quietly growing roots.", virtue: 0, faith: 0, talents: 1 },
      { kind: "sin", text: "Start telling people they probably don't deserve it.", outcome: "That's how Ahab's story started — wanting led to whispering, and whispering led to ruin.", virtue: -10, faith: -6, talents: 0 }
    ]
  }
];

// Lot outcomes for the "Moment of Grace" roll. Faith ≥ 70 adds +1 to the roll (max 7).
// "The lot is cast into the lap; but the whole disposing thereof is of the LORD." — Proverbs 16:33
window.GRACE_OUTCOMES = {
  1: { icon: "🏜️", title: "A Trial in the Wilderness", text: "Like Job, you face a hard season — but trials grow faith.", ref: "James 1:2–3", talents: -3, faith: 5, trial: true },
  2: { icon: "🕊️", title: "A Quiet Road", text: "A peaceful stretch of the journey. A dove keeps you company.", ref: "Psalm 23:2", talents: 1 },
  3: { icon: "🍞", title: "Manna from Heaven", text: "Bread falls like dew. There's enough for today.", ref: "Exodus 16:15", talents: 5 },
  4: { icon: "🐦‍⬛", title: "Ravens Bring Bread", text: "As God fed Elijah by the brook, you're provided for in an unexpected way.", ref: "1 Kings 17:6", talents: 4, faith: 3 },
  5: { icon: "👼", title: "An Angel Visits", text: "An angel stands beside you. Angels can guide a hard choice or guard you in a trial.", ref: "Psalm 91:11", angel: 1 },
  6: { icon: "👑", title: "A Double Portion", text: "Like Elisha receiving Elijah's spirit, you're blessed twice over.", ref: "2 Kings 2:9", talents: 5, crown: 1 },
  7: { icon: "🔥", title: "A Glimpse of the Chariot of Fire", text: "Your faith opens your eyes: the hills are full of horses and chariots of fire!", ref: "2 Kings 6:17", angel: 1, chariot: 1 }
};

window.CHARIOTS = [
  { name: "Shepherd's Cart", bonus: 0, cost: 0, desc: "Humble beginnings — David was a shepherd too." },
  { name: "Bronze Chariot", bonus: 1, cost: 10, desc: "+1 talent on every righteous choice." },
  { name: "Golden Chariot", bonus: 2, cost: 20, desc: "+2 talents on every righteous choice." },
  { name: "Chariot of Fire", bonus: 3, cost: 30, desc: "+3 talents on every righteous choice. Elijah rode one to heaven." }
];
