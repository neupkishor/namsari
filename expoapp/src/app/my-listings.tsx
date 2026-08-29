import { UserPropertyListScreen } from '@@/components/user-property-list-screen';

export default function MyListingsScreen() {
  return <UserPropertyListScreen kind="listings" title="My listings" emptyTitle="No active listings" emptyText="Properties you post will appear here." />;
}
