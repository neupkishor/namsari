import { UserPropertyListScreen } from '@@/components/user-property-list-screen';

export default function SavedPropertiesScreen() {
  return <UserPropertyListScreen kind="favourites" title="Saved properties" emptyTitle="No saved properties" emptyText="Properties you favourite will appear here." />;
}
