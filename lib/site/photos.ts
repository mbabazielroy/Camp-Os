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
  canoe: { src: pexels(2734434), alt: "Two people paddling a canoe on the water", scene: "lake-sunset" },
  campfire: { src: pexels(9630132), alt: "Kids and leaders roasting marshmallows around a campfire", scene: "campfire-night" },
  smores: { src: pexels(9212885), alt: "A group roasting marshmallows over the fire in the woods", scene: "campfire-night" },
  games: { src: pexels(4894721), alt: "A group of children running together outdoors", scene: "cabins-forest" },
  playing: { src: pexels(8813511), alt: "Children doing an activity together outside", scene: "tents-meadow" },
  together: { src: pexels(8813498), alt: "Children enjoying an activity together", scene: "river-morning" },
  friends: { src: pexels(10141084), alt: "Cheerful kids standing close together", scene: "cabins-forest" },
  hiking: { src: pexels(10484496), alt: "A group of teens walking a forest road on a summer day", scene: "forest-trail" },
  woods: { src: pexels(5037075), alt: "Three young people sitting together among the trees", scene: "forest-trail" },
  crafts: { src: pexels(8035135), alt: "Children doing an outdoor craft activity at camp", scene: "tents-meadow" },
  worship: { src: pexels(28239511), alt: "A group of young people praying together outdoors", scene: "river-morning" },
  bibleStudy: { src: pexels(13011294), alt: "People reading and studying the Bible together", scene: "cabins-forest" },
} satisfies Record<string, Photo>;
