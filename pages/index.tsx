import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

interface PasswordItem {
  id: number;
  account: string;
  password: string;
  description: string;
  date: string;
}

export default function Home() {
  const [password, setPassword] = useState<string>('');
  const [passwordLength, setPasswordLength] = useState<number>(12);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [savedPasswords, setSavedPasswords] = useState<PasswordItem[]>([]);
  const [accountName, setAccountName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [passwordMode, setPasswordMode] = useState<'generate' | 'custom'>('generate');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved passwords from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPasswords');
    if (saved) {
      setSavedPasswords(JSON.parse(saved));
    }
  }, []);

  // Save passwords to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
  }, [savedPasswords]);

  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 3000);
  };

  const generatePassword = (): void => {
    setIsGenerating(true);

    setTimeout(() => {
      let chars = 'abcdefghijklmnopqrstuvwxyz';
      if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (includeNumbers) chars += '0123456789';
      if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      let newPassword = '';
      for (let i = 0; i < passwordLength; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setPassword(newPassword);
      setIsGenerating(false);
    }, 500);
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Password disalin ke clipboard!');
    } catch (err) {
      showNotification('Gagal menyalin password', 'error');
    }
  };

  const savePassword = (): void => {
    if (!accountName || !password) {
      showNotification('Nama akun dan password harus diisi', 'error');
      return;
    }

    const newPassword: PasswordItem = {
      id: Date.now(),
      account: accountName,
      password: password,
      description: description,
      date: new Date().toLocaleDateString('id-ID')
    };

    setSavedPasswords([...savedPasswords, newPassword]);
    setAccountName('');
    setDescription('');
    setPassword('');
    showNotification('Password berhasil disimpan di vault!');
  };

  const deletePassword = (id: number): void => {
    setSavedPasswords(savedPasswords.filter(pwd => pwd.id !== id));
    showNotification('Password berhasil dihapus');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Password Generator - Penyimpanan Password Lokal</title>
        <meta name="description" content="Simpan dan generate password secara lokal" />
      </Head>

      {/* Notification */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <main className={styles.main}>
        <h1 className={styles.title}>Password Generator</h1>
        <p className={styles.subtitle}>Simpan password Anda secara aman tanpa login</p>

        <div className={styles.grid}>
          {/* Password Generator Section */}
          <div className={styles.card}>
            <h2>Password Generator</h2>

            {/* Password Mode Toggle */}
            <div className={styles.modeToggle}>
              <button
                className={`${styles.toggleButton} ${passwordMode === 'generate' ? styles.active : ''}`}
                onClick={() => setPasswordMode('generate')}
              >
                Generate
              </button>
              <button
                className={`${styles.toggleButton} ${passwordMode === 'custom' ? styles.active : ''}`}
                onClick={() => setPasswordMode('custom')}
              >
                Custom
              </button>
            </div>

            {/* Password Preview */}
            <div className={styles.passwordPreview}>
              <input
                type="text"
                value={password}
                readOnly={passwordMode === 'generate'}
                onChange={(e) => passwordMode === 'custom' && setPassword(e.target.value)}
                placeholder={
                  passwordMode === 'generate'
                    ? 'Password akan muncul di sini'
                    : 'Masukkan password custom'
                }
                className={styles.passwordInput}
              />
              {password && (
                <button
                  onClick={() => copyToClipboard(password)}
                  className={styles.smallButton}
                >
                  Salin
                </button>
              )}
            </div>

            {/* Generator Options */}
            <div className={styles.controls}>
              <label className={styles.rangeLabel}>
                Panjang Password: {passwordLength}
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                  className={styles.rangeInput}
                />
              </label>

              <div className={styles.options}>
                <label className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={() => setIncludeUppercase(!includeUppercase)}
                    className={styles.checkboxInput}
                  />
                  Huruf Besar
                </label>
                <label className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={() => setIncludeNumbers(!includeNumbers)}
                    className={styles.checkboxInput}
                  />
                  Angka
                </label>
                <label className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={() => setIncludeSymbols(!includeSymbols)}
                    className={styles.checkboxInput}
                  />
                  Simbol
                </label>
              </div>

              <button
                onClick={generatePassword}
                className={`${styles.primaryButton} ${isGenerating ? styles.generating : ''}`}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className={styles.spinner}></span>
                ) : (
                  passwordMode === 'generate' ? 'Generate Password' : 'Generate Custom Password'
                )}
              </button>
            </div>
          </div>

          {/* Save Password Section */}
          <div className={styles.card}>
            <h2>Simpan Password</h2>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Nama Akun (contoh: Instagram)</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Masukkan nama akun"
                className={styles.textInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Deskripsi (opsional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi tambahan"
                className={styles.textInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Password</label>
              <input
                type="text"
                value={password}
                readOnly
                placeholder={
                  passwordMode === 'generate'
                    ? 'Generate password terlebih dahulu'
                    : 'Generate atau masukkan password custom'
                }
                className={styles.passwordInput}
              />
            </div>
            <button
              onClick={savePassword}
              className={styles.primaryButton}
              disabled={!accountName || !password}
            >
              Simpan
            </button>
          </div>
        </div>

        {/* Saved Passwords Section */}
        <div className={styles.vaultSection}>
          <h2 className={styles.sectionTitle}>Password Generator Anda</h2>
          <p className={styles.vaultInfo}>
            {savedPasswords.length} password tersimpan secara lokal di browser Anda
          </p>

          {savedPasswords.length > 0 ? (
            <div className={styles.passwordList}>
              {savedPasswords.map((item) => (
                <div key={item.id} className={styles.passwordItem}>
                  <div className={styles.passwordDetails}>
                    <h3 className={styles.accountName}>{item.account}</h3>
                    <p className={styles.accountDescription}>{item.description || 'Tidak ada deskripsi'}</p>
                    <div className={styles.passwordMeta}>
                      <span className={styles.passwordHidden}>••••••••••••</span>
                      <span className={styles.passwordDate}>{item.date}</span>
                    </div>
                  </div>
                  <div className={styles.passwordActions}>
                    <button
                      onClick={() => copyToClipboard(item.password)}
                      className={styles.smallButton}
                    >
                      Salin
                    </button>
                    <button
                      onClick={() => deletePassword(item.id)}
                      className={styles.smallButtonDanger}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Belum ada password yang disimpan</p>
              <p className={styles.emptySubtext}>Generate dan simpan password untuk melihatnya di sini</p>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>© {new Date().getFullYear()} Password Vault - Disimpan secara lokal di browser Anda</p>
      </footer>
    </div>
  );
}