export const email = "astter2542@gmail.com";
export const artstation = "https://www.artstation.com/tanxzjakkarin6";

export const about =
  "I’m Jakkarin Sonchai, a 3D artist based in Ubon Ratchathani, Thailand. I build stylized characters, creatures and props for games, from modeling and hand-painted textures to rigging and Unity integration. I also take on Roblox avatar and UGC commissions.";

export const services = [
  ["3D Modeling", "Game-ready characters, creatures, weapons and props with clear silhouettes and topology built for their intended use."],
  ["Texturing & Rendering", "UV layouts, hand-painted or PBR textures, and renders that show the form and materials from their best angles."],
  ["Rigging & Motion", "Blender rigs, skin weights and motion studies for characters and creatures."],
  ["Roblox Avatars & UGC", "Stylized avatars, character bundles and accessories built for Roblox."],
  ["Unity Integration", "Import and setup for models, materials, rigs and animation in Unity."],
];

type Image = readonly [file: string, description: string];

export const reels: readonly (readonly Image[])[] = [
  [
    ["crimson-dragon-flight", "Crimson Dragon in flight"],
    ["char-seraph", "Nocturne Seraph turnaround"],
    ["beldia-armor", "Beldia armor texture study"],
    ["video-zombie-tiger", "Zombie Tiger run cycle"],
    ["video-rootback-gorilla", "Rootback Gorilla foliage rig"],
    ["kaijin-unity", "Kaijin sword attack in Unity"],
    ["roblox-golden-stand", "Golden Stand Roblox avatar"],
    ["video-serpent-animation-showcase", "Serpent animation showcase"],
    ["char-oni", "Oni Maiden character sheet"],
    ["mecha-hounds", "Mecha Hounds render"],
    ["char-aurora", "Aurora Seraph turnaround"],
  ],
  [
    ["roblox-stone-king", "Stone King Roblox avatar"],
    ["video-turn-seraph", "Nocturne Seraph turntable"],
    ["video-zombie-chameleon", "Zombie Chameleon walk cycle"],
    ["oni-unity-shader", "Oni toon shader study in Unity"],
    ["video-glowmoss-frog", "Glowmoss Frog jump"],
    ["briefcase-crma", "CRMA briefcase hardware detail"],
    ["video-rig-mech-5", "Mechanical rig study"],
    ["roblox-dio", "DIO Roblox avatar"],
    ["new-frog-avatar", "Frog avatar"],
    ["weapon-pack", "Stylized weapon pack"],
  ],
];

export type Project = {
  title: string;
  category: string;
  group: string;
  work?: number;
  images: readonly [Image, Image, Image];
};

export const projects: Project[] = [
  {
    title: "Creature Rigging",
    category: "Rigging & Motion",
    group: "motion",
    images: [
      ["thumbs/video-zombie-chameleon.jpg", "Zombie Chameleon with a curled tail"],
      ["thumbs/video-zombie-tiger.jpg", "Zombie Tiger mid-stride"],
      ["thumbs/video-rootback-gorilla.jpg", "Rootback Gorilla with animated foliage"],
    ],
  },
  {
    title: "Nocturne Seraph",
    category: "Character Art",
    group: "characters",
    work: 2,
    images: [
      ["work/char-seraph.jpg", "Nocturne Seraph character turnaround"],
      ["thumbs/video-turn-seraph.jpg", "Nocturne Seraph in the turntable preview"],
      ["landing/seraph-turn.webp", "Nocturne Seraph from another angle"],
    ],
  },
  {
    title: "Crimson Wyvern",
    category: "Creature Art",
    group: "creatures",
    work: 57,
    images: [
      ["work/crimson-dragon-front.webp", "Crimson Dragon viewed from the front"],
      ["work/crimson-dragon-process-c.jpg", "Crimson Dragon model in progress"],
      ["work/crimson-dragon-flight.webp", "Crimson Dragon with wings extended"],
    ],
  },
];
