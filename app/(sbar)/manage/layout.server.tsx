// Holds the server side of the manage layout boundary.
export default function ServerLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: '#ffffff', minHeight: '100%' }}>{children}</div>;
}
