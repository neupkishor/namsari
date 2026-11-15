// Renders the utility route's server owned page container.
export default function ServerLayout({ children }: { children: React.ReactNode }) {
  return <main style={{ minHeight: '100%', background: 'transparent' }}>{children}</main>;
}
