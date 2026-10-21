// Photos for the public website. These are placeholder stock photos from Pexels
// (free to use, no attribution required) until real Mill Stream photos are added:
// drop camp photos into public/images/ and point `src` at them, e.g. "/images/waterfront.jpg".
// Each photo names an illustrated scene (public/images/scenes) shown while it loads
// or if it can't be loaded.

export type Scene =
  | "lake-sunset"
  | "campfire-night"
  | "cabins-forest"
  | "tents-meadow"
  | "river-morning"
  | "forest-trail";

export type Photo = { src: string; alt: string; scene: Scene };

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;

export const photos = {
  waterfront: { src: pexels(2851064), alt: "Campers paddling a red canoe across a calm lake", scene: "lake-sunset" },
  campfire: { src: pexels(4994136), alt: "Friends sitting around a campfire at night", scene: "campfire-night" },
  games: { src: pexels(296301), alt: "Children playing a team game on a grassy field", scene: "cabins-forest" },
  playing: { src: pexels(8954918), alt: "Kids playing together on the grass", scene: "tents-meadow" },
  hiking: { src: pexels(5037003), alt: "Campers walking through the forest", scene: "forest-trail" },
  woods: { src: pexels(5533896), alt: "A child exploring a path through the woods", scene: "forest-trail" },
  cabin: { src: pexels(10119626), alt: "A wooden cabin among the trees beside a lake", scene: "cabins-forest" },
  tent: { src: pexels(176381), alt: "A tent pitched by the water", scene: "tents-meadow" },
  river: { src: pexels(2108172), alt: "A calm river winding through green forest", scene: "river-morning" },
  canoe: { src: pexels(3678422), alt: "A canoe resting on a still lake", scene: "lake-sunset" },
} satisfies Record<string, Photo>;
