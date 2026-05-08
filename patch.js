const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'frontend/app/product/TavernChatRoom.jsx');
let content = fs.readFileSync(target, 'utf8');

// 1. Imports
content = content.replace(
  "import StateCardReviewPanel from './StateCardReviewPanel'",
  "import StateCardReviewPanel from './StateCardReviewPanel'\nimport GardenFarmPanel from './GardenFarmPanel'\nimport { loadFarmProgress, saveFarmProgress, updateFarmProgress, buildFarmActionPrompt } from './tavernFarmModes'"
);

// 2. State
content = content.replace(
  "const [guildProgress, setGuildProgress] = useState(() => loadGuildProgress(roomId, visitorId))",
  "const farmEnabled = playMode.id === 'farm'\n  const [guildProgress, setGuildProgress] = useState(() => loadGuildProgress(roomId, visitorId))\n  const [farmProgress, setFarmProgress] = useState(() => loadFarmProgress(roomId, visitorId))"
);

// 3. useEffect
content = content.replace(
  "  // Auto-scroll to bottom",
  "  useEffect(() => {\n    if (!farmEnabled) return\n    setFarmProgress(loadFarmProgress(roomId, visitorId))\n  }, [farmEnabled, roomId, visitorId])\n\n  // Auto-scroll to bottom"
);

// 4. Action handler
const farmActionCode = `  function handleFarmAction(action, payload = null) {
    if (!farmEnabled || sending) return
    if (action !== 'status') {
      const nextProgress = updateFarmProgress(farmProgress, action, payload)
      const savedProgress = saveFarmProgress(roomId, visitorId, nextProgress)
      setFarmProgress(savedProgress)
    }
    handleSend(buildFarmActionPrompt(action, payload))
  }

  function handleMiniGameStart(template) {`;

content = content.replace(
  "  function handleMiniGameStart(template) {",
  farmActionCode
);

// 5. Render Panel
const panelCode = `              <GuildQuestPanel
                enabled={guildEnabled}
                progress={guildProgress}
                quests={guildQuests}
                tier={guildTier}
                sending={sending}
                onAction={handleGuildAction}
              />

              <GardenFarmPanel
                enabled={farmEnabled}
                progress={farmProgress}
                sending={sending}
                onAction={handleFarmAction}
              />`;

content = content.replace(
  /<GuildQuestPanel[\s\S]*?\/>/,
  panelCode
);

fs.writeFileSync(target, content, 'utf8');
console.log('Modifications applied successfully.');
