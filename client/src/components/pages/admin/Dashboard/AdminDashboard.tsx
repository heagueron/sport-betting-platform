import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../../layout/AdminLayout/AdminLayout';
import { getUsers } from '../../../../services/user.service';
import { getEvents } from '../../../../services/event.service';
import { getSports } from '../../../../services/sport.service';
import styles from './AdminDashboard.module.css';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    sports: 0,
    events: 0,
    bets: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersResponse = await getUsers({ limit: 5 });
        if (usersResponse.success && usersResponse.data) {
          setRecentUsers(usersResponse.data.data);
          setStats(prev => ({ ...prev, users: usersResponse.data.total }));
        }

        // Fetch sports
        const sportsResponse = await getSports();
        if (sportsResponse.success && sportsResponse.data) {
          setStats(prev => ({ ...prev, sports: sportsResponse.data.length }));
        }

        // Fetch events
        const eventsResponse = await getEvents({ limit: 5 });
        if (eventsResponse.success && eventsResponse.data) {
          setRecentEvents(eventsResponse.data.data);
          setStats(prev => ({ ...prev, events: eventsResponse.data.total }));
        }

        // For bets, we would normally fetch from the API
        // For now, we'll use a placeholder value
        setStats(prev => ({ ...prev, bets: 120 }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className={styles.dashboard}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p>Loading dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Total Users</div>
            <div className={styles.statValue}>{stats.users}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Total Sports</div>
            <div className={styles.statValue}>{stats.sports}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Total Events</div>
            <div className={styles.statValue}>{stats.events}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Total Bets</div>
            <div className={styles.statValue}>{stats.bets}</div>
          </div>
        </div>

        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recent Users</h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Balance</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>${user.balance.toFixed(2)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/users" className={styles.viewAllLink}>
            View All Users
          </Link>
        </div>

        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recent Events</h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Event</th>
                <th>Sport</th>
                <th>Status</th>
                <th>Start Time</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {recentEvents.map(event => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.sport?.name}</td>
                  <td>
                    <span className={`${styles.status} ${styles[event.status.toLowerCase()]}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>{formatDate(event.startTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/events" className={styles.viewAllLink}>
            View All Events
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};
