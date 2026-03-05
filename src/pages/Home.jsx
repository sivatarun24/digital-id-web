import './Home.css';

export default function Home({ user }) {
  return (
    <div className="home-page-content">
      <h2>Welcome{user?.name ? `, ${user.name}` : ''}!</h2>
      <p className="home-greeting">This is your dashboard. Use the menu in the top-right corner to navigate.</p>
    </div>
  );
}
