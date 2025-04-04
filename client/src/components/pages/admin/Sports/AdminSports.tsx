import { useState, useEffect } from 'react';
import { AdminLayout } from '../../../layout/AdminLayout/AdminLayout';
import { Button } from '../../../common/Button/Button';
import { Input } from '../../../common/Input/Input';
import { getSports, createSport, updateSport, deleteSport } from '../../../../services/sport.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import styles from './AdminSports.module.css';

interface Sport {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AdminSports = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentSport, setCurrentSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    active: true,
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    setIsLoading(true);
    try {
      const response = await getSports();
      if (response.success && response.data) {
        setSports(response.data);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sport: Sport) => {
    setModalMode('edit');
    setCurrentSport(sport);
    setFormData({
      name: sport.name,
      active: sport.active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSport(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        const response = await createSport(formData);
        if (response.success && response.data) {
          setSports([...sports, response.data]);
          closeModal();
        }
      } else if (modalMode === 'edit' && currentSport) {
        const response = await updateSport(currentSport.id, formData);
        if (response.success && response.data) {
          setSports(sports.map(sport =>
            sport.id === currentSport.id ? response.data : sport
          ));
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving sport:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        const response = await deleteSport(id);
        if (response.success) {
          setSports(sports.filter(sport => sport.id !== id));
        }
      } catch (error) {
        console.error('Error deleting sport:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className={styles.sportsPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('admin.sportsManagement')}</h1>
          <Button onClick={openCreateModal}>{t('admin.addNewSport')}</Button>
        </div>

        {isLoading ? (
          <p>{t('admin.loadingSports')}</p>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>{t('auth.name')}</th>
                <th>{t('admin.slug')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.created')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {sports.map(sport => (
                <tr key={sport.id}>
                  <td>{sport.name}</td>
                  <td>{sport.slug}</td>
                  <td>
                    <div className={styles.statusText}>
                      <span className={`${styles.status} ${sport.active ? styles.active : styles.inactive}`}></span>
                      {sport.active ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td>{formatDate(sport.createdAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => openEditModal(sport)}
                        aria-label="Edit sport"
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(sport.id)}
                        aria-label="Delete sport"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {modalMode === 'create' ? t('admin.addNewSport') : t('admin.editSport')}
                </h2>
                <button className={styles.closeButton} onClick={closeModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  <Input
                    label={t('admin.sportName')}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={styles.formGroup}>
                    <div className={styles.formCheckbox}>
                      <input
                        type="checkbox"
                        id="active"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="active">{t('admin.active')}</label>
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <Button variant="outline" onClick={closeModal}>
                    {t('admin.cancel')}
                  </Button>
                  <Button type="submit">
                    {modalMode === 'create' ? t('admin.create') : t('admin.save')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
