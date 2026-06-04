import { aboutService } from '@/lib/firebase/services/aboutService';
import { AboutSection } from '@/types';
import AboutClient from '@/components/public/AboutClient';

const DEFAULT_SECTIONS = [
  {
    id: 'who_am_i_fallback',
    key: 'who_am_i',
    label: 'Curious Mind',
    content: '<p>A dreamer navigating the infinite expanse of both the cosmos and the human imagination. I am deeply fascinated by the hidden mechanics of the universe, the quiet beauty of traditional philosophies, and the boundless possibilities of science fiction. Every star in the sky represents a question waiting to be asked.</p>',
  },
  {
    id: 'things_i_wonder_fallback',
    key: 'things_i_wonder',
    label: 'Things I Wonder About',
    content: '<p>I often find myself looking up at the night sky, pondering the sheer scale of existence. Are we truly alone in this grand architecture? How do the teachings of ancient philosophies align with modern cosmic discoveries? I wonder about the intersection of human consciousness and the vast emptiness of space.</p>',
  },
  {
    id: 'things_i_love_fallback',
    key: 'things_i_love',
    label: 'Things I Love',
    content: '<p>I am deeply inspired by the quiet aesthetics of Japanese culture—the concept of wabi-sabi, finding beauty in imperfection and impermanence. I love the thrill of discovering new celestial bodies, the evocative melodies of J-Pop, and the immersive worlds built by brilliant science fiction authors.</p>',
  },
  {
    id: 'current_mission_fallback',
    key: 'current_mission',
    label: 'Current Journey',
    content: '<p>Right now, I am focused on bridging the gap between scientific curiosity and creative storytelling. I want to build worlds, write stories, and capture moments that make people pause, look up, and realize just how wondrous it is to exist right here, right now.</p>',
  },
];

export const metadata = {
  title: 'About | StarMeyee',
  description: 'A glimpse into the universe of StarMeyee, exploring cosmic stories, art, and philosophy.',
};

export default async function AboutPage() {
  let sections: AboutSection[] = [];
  try {
    const data = await aboutService.getAboutContent();
    const validData = data.filter(s => s.content && s.content.trim() !== '');

    if (validData.length > 0) {
      const order = ['who_am_i', 'things_i_wonder', 'things_i_love', 'current_mission', 'long_form_story'];
      sections = validData.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    } else {
      sections = DEFAULT_SECTIONS as AboutSection[];
    }
  } catch (error) {
    console.error('Error fetching about content on server:', error);
    sections = DEFAULT_SECTIONS as AboutSection[];
  }

  return <AboutClient initialSections={sections} />;
}

