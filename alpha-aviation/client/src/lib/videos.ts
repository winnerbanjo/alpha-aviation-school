// Central registry for every film clip served from /public/videos.
// Each clip is a silent, web-optimised H.264 MP4 with a matching WebP poster.
// Source masters live outside /public in design/video-sources.

export type VideoName =
  | "aviation-campus"
  | "aviation-instruction"
  | "flight-deck-mentoring"
  | "hangar-practical"
  | "instructor-briefing"
  | "aircraft-planning"
  | "airport-operations-model";

export interface VideoClip {
  name: VideoName;
  /** Short chapter label used in the showreel */
  chapter: string;
  title: string;
  caption: string;
  orientation: "landscape" | "portrait";
  /** Approximate running time in seconds, used for chapter progress */
  duration: number;
}

export const videoLibrary: Record<VideoName, VideoClip> = {
  "aviation-campus": {
    name: "aviation-campus",
    chapter: "Arrival",
    title: "Where the journey begins",
    caption: "A light aircraft waits on the apron between training buildings — the first view of a career in aviation.",
    orientation: "landscape",
    duration: 7,
  },
  "aviation-instruction": {
    name: "aviation-instruction",
    chapter: "Briefing",
    title: "Learning from people who know the industry",
    caption: "An instructor briefs a class beside a training aircraft, connecting theory to the operation in front of them.",
    orientation: "landscape",
    duration: 13,
  },
  "flight-deck-mentoring": {
    name: "flight-deck-mentoring",
    chapter: "Flight deck",
    title: "Inside the flight deck",
    caption: "An instructor walks a trainee through a light-aircraft cockpit — clear communication and methodical preparation.",
    orientation: "landscape",
    duration: 14,
  },
  "hangar-practical": {
    name: "hangar-practical",
    chapter: "Hands-on",
    title: "Practical, hands-on learning",
    caption: "Students work side by side on an aircraft in the hangar, building confidence through doing.",
    orientation: "landscape",
    duration: 10.7,
  },
  "instructor-briefing": {
    name: "instructor-briefing",
    chapter: "Mentorship",
    title: "Guidance at every step",
    caption: "A professional instructor explains the aircraft — the kind of mentorship that shapes confident professionals.",
    orientation: "portrait",
    duration: 20,
  },
  "aircraft-planning": {
    name: "aircraft-planning",
    chapter: "Precision",
    title: "The detail behind every journey",
    caption: "Blueprints, models and careful planning — the precision that shapes the aviation industry.",
    orientation: "landscape",
    duration: 18,
  },
  "airport-operations-model": {
    name: "airport-operations-model",
    chapter: "Operations",
    title: "Understanding the airport environment",
    caption: "Runway lighting and aircraft movement on a scale airport model — a different perspective on operations.",
    orientation: "landscape",
    duration: 10.7,
  },
};

/** Order used by the homepage showreel (the portrait clip is featured elsewhere) */
export const showreelOrder: VideoName[] = [
  "aviation-campus",
  "aviation-instruction",
  "flight-deck-mentoring",
  "hangar-practical",
  "aircraft-planning",
  "airport-operations-model",
];

export const videoSrc = (name: VideoName) => `/videos/${name}.mp4`;
export const posterSrc = (name: VideoName) => `/videos/${name}-poster.webp`;
