import SearchLayoutClient from './layout.client';

// Provides the client layout boundary for the search route.
export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <SearchLayoutClient>{children}</SearchLayoutClient>;
}
