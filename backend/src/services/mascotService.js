import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const cache = new Map();

// ── Check whether Bedrock credentials are fully configured ────────────────
// All three env vars must be present to avoid the AWS SDK credential
// provider chain spam: "Could not load credentials from any providers"
const isBedrockReady = () =>
  Boolean(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

export const MASCOT_PROMPTS = {
  level_up:      { prompt: 'Cute chibi anime mascot with starry wide eyes, arms raised in victory, magical sparkles and glowing stars exploding around, golden light rays shining behind character, purple gradient background, ecstatic happy expression, energetic celebration pose, kawaii game reward style, clean white outline, flat color illustration, smooth shading, modern game UI artwork, ultra detailed, 4K quality', label: 'Level Up!' },
  badge_earned:  { prompt: 'Cute chibi anime mascot wearing black sunglasses, holding shiny golden medal proudly, confident smirk expression, glowing aura around character, colorful confetti raining down, warm orange gradient background, achievement unlocked mood, kawaii reward screen illustration, flat clean colors, smooth shading, thick white outline, modern gaming UI art style, ultra detailed, 4K quality', label: 'Badge Earned!' },
  clean_code:    { prompt: 'Cute chibi anime mascot celebrating with party hat, arms stretched open happily, floating green sparkles surrounding character, soft green glowing background, huge cheerful smile, wholesome coding success mood, kawaii celebration style, flat color clean illustration, smooth shading, thick white outline, modern app reward UI style, ultra detailed, 4K quality', label: 'Clean Code!' },
  bug_found:     { prompt: 'Cute chibi anime mascot with giant shocked eyes and open screaming mouth, hands pressed against cheeks dramatically, tiny cartoon bugs floating around character, glowing orange warning lights, panic expression, chaotic coding problem mood, kawaii surprised reaction style, flat illustration, smooth shading, thick white outline, game warning popup style, ultra detailed, 4K quality', label: 'Bug Found!' },
  critical_bug:  { prompt: 'Cute chibi anime mascot sweating heavily with terrified wide eyes, red warning symbols flashing around character, alarm lights glowing intensely, dark red emergency background, trembling panic pose, urgent danger atmosphere, kawaii dramatic reaction illustration, flat clean colors, smooth shading, thick white outline, cyber alert game UI style, ultra detailed, 4K quality', label: 'Critical Bug!' },
  streak:        { prompt: 'Cute chibi anime mascot surrounded by glowing fire aura, fist pumped upward confidently, orange and blue flames swirling around body, intense determined eyes, floating streak energy effects, powerful energetic pose, coding streak achievement mood, kawaii anime game style, flat illustration, smooth shading, thick white outline, modern gaming reward screen, ultra detailed, 4K quality', label: 'On Fire!' },
  streak_broken: { prompt: 'Cute chibi anime mascot with droopy teary eyes and tiny sad frown, single tear rolling down cheek, floating broken heart above head, rainy grey background, slouched disappointed pose, emotional soft atmosphere, kawaii sad illustration style, flat clean colors, smooth shading, thick white outline, emotional game popup UI style, ultra detailed, 4K quality', label: 'Streak Broken' },
  welcome_back:  { prompt: 'Cute chibi anime mascot waving enthusiastically with both hands, huge warm smile, rosy cheeks glowing softly, magical sparkles floating around, teal gradient background, floating laptop beside character, cheerful welcoming mood, kawaii friendly illustration, flat clean colors, smooth shading, thick white outline, modern app welcome screen style, ultra detailed, 4K quality', label: 'Welcome Back!' },
  analyzing:     { prompt: 'Cute chibi anime mascot wearing monocle while holding magnifying glass, thoughtful detective pose with finger on chin, floating gears and glowing code symbols surrounding character, purple coding background, concentrated intelligent expression, AI analysis atmosphere, kawaii detective illustration style, flat clean colors, smooth shading, thick white outline, futuristic coding assistant UI art, ultra detailed, 4K quality', label: 'Analyzing...' },
  security_alert:{ prompt: 'Cute chibi anime mascot in protective warrior stance holding glowing magical shield with lock symbol, serious determined eyes, orange warning symbols floating around, dark cyber security background with orange glow, protective guardian atmosphere, kawaii cyber defense illustration, flat clean colors, smooth shading, thick white outline, futuristic security popup UI style, ultra detailed, 4K quality', label: 'Security Alert!' },
  milestone:     { prompt: 'Cute chibi anime mascot jumping joyfully with both arms raised high, giant fireworks exploding behind character, colorful confetti storm, floating golden trophy nearby, rainbow celebration lights everywhere, massive happy grin, epic festival victory atmosphere, kawaii game celebration illustration, flat clean colors, smooth shading, thick white outline, modern reward screen UI style, ultra detailed, 4K quality', label: 'Milestone!' },
  idle:          { prompt: 'Cute chibi anime mascot sleeping peacefully while sitting upright, closed sleepy eyes with floating zzz bubbles, tiny peaceful smile, soft pillow behind character, dark blue nighttime background with twinkling stars, calm relaxing atmosphere, kawaii sleepy illustration style, flat clean colors, smooth shading, thick white outline, cozy app idle screen style, ultra detailed, 4K quality', label: 'Resting...' },
};

const NEGATIVE_PROMPT = 'realistic, 3D, photographic, text, watermark, blurry, horror, dark shadows, extra limbs, ugly face, distorted anatomy, messy background';

let _client = null;
const getClient = () => {
  if (_client) return _client;
  // Only create the client when credentials are actually present.
  // Creating it without credentials triggers the full AWS provider chain
  // which logs "Could not load credentials from any providers" repeatedly.
  if (!isBedrockReady()) return null;
  _client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    },
  });
  return _client;
};

export const generateMascotImage = async (type) => {
  // ── Fast-exit: no credentials → return disabled stub, no SDK call ──
  if (!isBedrockReady()) {
    return { success: false, dataUri: null, cached: false, type, fallback: true,
             message: 'Mascot feature disabled (missing AWS credentials)' };
  }

  if (cache.has(type)) return { dataUri: cache.get(type), cached: true, type };

  const def = MASCOT_PROMPTS[type];
  if (!def) throw new Error(`Unknown mascot type: ${type}`);

  const client = getClient();
  if (!client) throw new Error('Bedrock client unavailable');

  const modelId = process.env.BEDROCK_IMAGE_MODEL || 'amazon.titan-image-generator-v2:0';

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept:      'application/json',
    body: JSON.stringify({
      taskType: 'TEXT_IMAGE',
      textToImageParams: { text: def.prompt, negativeText: NEGATIVE_PROMPT },
      imageGenerationConfig: {
        numberOfImages: 1,
        height: 1024, width: 1024,
        cfgScale: 9.0,
        seed: Math.floor(Math.random() * 2147483647),
      },
    }),
  });

  const response = await client.send(command);
  const result   = JSON.parse(new TextDecoder().decode(response.body));
  const base64   = result.images?.[0];
  if (!base64) throw new Error('Bedrock returned no image data');

  const dataUri = `data:image/png;base64,${base64}`;
  cache.set(type, dataUri);
  return { dataUri, cached: false, type };
};

export const getCachedMascot = (type) => cache.get(type) || null;
export const clearMascotCache = () => { cache.clear(); _client = null; };
export const getMascotTypes   = () => Object.keys(MASCOT_PROMPTS);
