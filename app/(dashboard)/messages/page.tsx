import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { MessagesClient } from './MessagesClient'

const THREADS = [
  {
    id: 'thread-001',
    with: 'Suresh Mehta (Parent)',
    avatar: 'SM',
    subject: 'Arjun\'s JEE progress',
    last_message: 'Thank you for the update. We\'ll make sure he practices more at home.',
    time: '10:24 AM',
    unread: 0,
    type: 'parent',
  },
  {
    id: 'thread-002',
    with: 'Arjun Mehta',
    avatar: 'AM',
    subject: 'Doubt in Rotational Motion',
    last_message: 'Sir, I\'m unable to understand the concept of moment of inertia for hollow cylinders. Can we discuss tomorrow?',
    time: 'Yesterday',
    unread: 1,
    type: 'student',
  },
  {
    id: 'thread-003',
    with: 'Mohan Sharma (Parent)',
    avatar: 'MS',
    subject: 'Priya\'s attendance concern',
    last_message: 'Priya was unwell last week. She will be attending from Monday.',
    time: 'Mon',
    unread: 0,
    type: 'parent',
  },
  {
    id: 'thread-004',
    with: 'Ananya Singh',
    avatar: 'AS',
    subject: 'Study material for Ecology',
    last_message: 'Received the notes, sir. Thank you!',
    time: 'Nov 9',
    unread: 0,
    type: 'student',
  },
  {
    id: 'thread-005',
    with: 'R. Kumar (Teacher)',
    avatar: 'RK',
    subject: 'JEE Batch schedule change',
    last_message: 'I can take the extra class on Saturday at 8 AM if that works.',
    time: 'Nov 8',
    unread: 2,
    type: 'staff',
  },
  {
    id: 'thread-006',
    with: 'Harpal Singh (Parent)',
    avatar: 'HS',
    subject: 'Fee installment query',
    last_message: 'When is the 3rd installment due? I need to plan accordingly.',
    time: 'Nov 7',
    unread: 1,
    type: 'parent',
  },
]

const ACTIVE_THREAD_MESSAGES = [
  { from: 'Arjun Mehta', text: 'Sir, I\'m unable to understand the concept of moment of inertia for hollow cylinders. Can we discuss tomorrow?', time: 'Yesterday 6:45 PM', isMine: false },
  { from: 'You', text: 'Of course Arjun! Come 15 minutes before class tomorrow. We\'ll work through it with the derivation.', time: 'Yesterday 7:12 PM', isMine: true },
  { from: 'Arjun Mehta', text: 'Thank you sir! Also, is the formula different for solid vs hollow cylinders?', time: 'Yesterday 7:15 PM', isMine: false },
  { from: 'You', text: 'Yes — for solid cylinder I = (1/2)MR², for hollow cylinder I = MR². Bring your notes tomorrow.', time: 'Yesterday 7:30 PM', isMine: true },
]

export default async function MessagesPage() {
  const totalUnread = THREADS.reduce((a, t) => a + t.unread, 0)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Messages"
        description={`In-app messaging with students, parents, and staff${totalUnread > 0 ? ` · ${totalUnread} unread` : ''}`}
        action={<Button size="sm">+ New Message</Button>}
      />
      <MessagesClient threads={THREADS} activeMessages={ACTIVE_THREAD_MESSAGES} />
    </div>
  )
}
