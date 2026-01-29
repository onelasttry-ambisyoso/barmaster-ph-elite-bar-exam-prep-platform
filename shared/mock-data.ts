import type { CodalProvision } from './types';
export const MOCK_CODALS: CodalProvision[] = [
  {
    id: 'civ-art1',
    subject: 'Civil Law',
    title: 'Article 1',
    reference: 'Civil Code',
    content: 'This Act shall be known as the "Civil Code of the Philippines."',
    isOfficial: true,
    ownerId: 'system'
  },
  {
    id: 'civ-art2',
    subject: 'Civil Law',
    title: 'Article 2',
    reference: 'Civil Code',
    content: 'Laws shall take effect after fifteen days following the completion of their publication in the Official Gazette, unless it is otherwise provided. This Code shall take effect one year after such publication.',
    isOfficial: true,
    ownerId: 'system'
  },
  {
    id: 'pol-art3-sec1',
    subject: 'Political Law',
    title: 'Article III, Section 1',
    reference: '1987 Constitution',
    content: 'No person shall be deprived of life, liberty, or property without due process of law, nor shall any person be denied the equal protection of the laws.',
    isOfficial: true,
    ownerId: 'system'
  },
  {
    id: 'crim-art1',
    subject: 'Criminal Law',
    title: 'Article 1',
    reference: 'Revised Penal Code',
    content: 'This Code shall take effect on the first day of January, nineteen hundred and thirty-two.',
    isOfficial: true,
    ownerId: 'system'
  },
  {
    id: 'crim-art2',
    subject: 'Criminal Law',
    title: 'Article 2',
    reference: 'Revised Penal Code',
    content: 'Except as provided in the treaties and laws of preferential application, the provisions of this Code shall be enforced not only within the Philippine Archipelago, including its atmosphere, its interior waters and maritime zone, but also outside of its jurisdiction, against those who:',
    isOfficial: true,
    ownerId: 'system'
  }
];
export const MOCK_USERS = [
  { id: 'dev-user', name: 'Bar Aspirant', joinedAt: Date.now() }
];