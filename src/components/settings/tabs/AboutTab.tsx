import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight, ExternalLink, Globe, Scale, Code2, Cpu, Monitor, User, Package, Fingerprint, Info, RefreshCw } from 'lucide-react';
import { SettingsGroup } from '../SettingsGroup';
import Logo from '../../common/Logo';
import { Button } from '../../ui/Button';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import { getString } from '../../../lib/i18n/index';
import { openExternal } from '../../../lib/openExternal';
import { getAppMetadata, type AppMetadata } from '../../../lib/appMetadata';
import { getSystemMetadata, type SystemMetadata } from '../../../lib/systemMetadata';
import { useUpdaterStore } from '../../../store/useUpdaterStore';
import { updateBlockedStringKey } from '../../../lib/updateSupport';
import { useUiStore } from '../../../store/useUiStore';

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function LinkRow({ icon, label, value, href, onSelect }: { icon: ReactNode; label: string; value: string; href?: string; onSelect?: () => void }) {
  const select = onSelect ?? (href ? () => void openExternal(href) : undefined);
  return (
    <div
      onClick={select}
      className={`flex items-center justify-between px-5 py-4 hover:bg-surface-container transition-colors duration-200 ease-out group ${select ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3 shrink-0 pr-4">
        <span className="text-chrome-neutral-400">{icon}</span>
        <span className="text-sm font-medium text-chrome-neutral-200">{label}</span>
      </div>
      <div className="flex items-center justify-end gap-2 min-w-0 text-right">
        {value && <span className="text-sm text-chrome-neutral-400 break-all">{value}</span>}
        {href && <ExternalLink size={12} className="text-chrome-neutral-500 group-hover:text-chrome-neutral-300 transition-colors" />}
        {onSelect && <ChevronRight size={14} className="text-chrome-neutral-500 group-hover:text-chrome-neutral-300 transition-colors" />}
      </div>
    </div>
  );
}

const unknown = () => getString('settings_unknown');

const sourceLabel = (source?: AppMetadata['source'] | SystemMetadata['source']) => {
  if (source === 'tauri' || source === 'tauri-os') return getString('settings_source_tauri');
  if (source === 'fallback' || source === 'browser-fallback') return getString('settings_source_fallback');
  return unknown();
};

export function AboutTab() {
  const [appMetadata, setAppMetadata] = useState<AppMetadata | null>(null);
  const [systemMetadata, setSystemMetadata] = useState<SystemMetadata | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const autoCheck = useUpdaterStore((s) => s.autoCheck);
  const setAutoCheck = useUpdaterStore((s) => s.setAutoCheck);
  const checkForUpdates = useUpdaterStore((s) => s.checkForUpdates);
  const updateSupport = useUpdaterStore((s) => s.support);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    let active = true;
    Promise.all([getAppMetadata(), getSystemMetadata()])
      .then(([app, system]) => {
        if (!active) return;
        setAppMetadata(app);
        setSystemMetadata(system);
      })
      .catch(() => {
        if (!active) return;
        setAppMetadata(null);
        setSystemMetadata(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const store = useUpdaterStore.getState();
    void store.loadPreferences();
    void store.loadSupport();
  }, []);

  const handleCheckForUpdates = async () => {
    setCheckingUpdate(true);
    try {
      const result = await checkForUpdates({ silent: false });
      if (result === 'uptodate') {
        showToast({ variant: 'success', message: getString('updater_up_to_date') });
      } else if (result === 'error') {
        showToast({ variant: 'error', message: getString('updater_check_failed') });
      }
      // 'available' opens the global UpdateDialog automatically.
    } finally {
      setCheckingUpdate(false);
    }
  };

  const appName = appMetadata?.name ?? getString('settings_loading_metadata');

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col items-center py-8">
        <Logo size={72} />
        <h2 className="text-2xl font-bold text-chrome-neutral-100 mt-4">{appName}</h2>
        <p className="text-sm text-chrome-neutral-400 mt-1">{getString('settings_about_subtitle')}</p>
      </div>

      <SettingsGroup title={getString('settings_group_app')}>
        <LinkRow icon={<Code2 size={16} />} label={getString('settings_version')} value={appMetadata?.version ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Fingerprint size={16} />} label={getString('settings_identifier')} value={appMetadata?.identifier ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Cpu size={16} />} label={getString('settings_tauri_version')} value={appMetadata?.tauriVersion ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Package size={16} />} label={getString('settings_bundle_type')} value={appMetadata?.bundleType ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Info size={16} />} label={getString('settings_metadata_source')} value={sourceLabel(appMetadata?.source)} />
      </SettingsGroup>

      <SettingsGroup title={getString('settings_group_updates')}>
        {updateSupport && !updateSupport.supported && updateSupport.reason ? (
          <div className="px-5 py-4">
            <div className="text-sm font-medium text-chrome-neutral-200">
              {getString(updateBlockedStringKey(updateSupport.reason))}
            </div>
            <div className="text-xs text-chrome-neutral-400 mt-0.5">
              {getString('settings_check_for_updates_desc', appMetadata?.version ?? unknown())}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex-1 min-w-0 mr-4">
                <div className="text-sm font-medium text-chrome-neutral-200">{getString('settings_check_for_updates')}</div>
                <div className="text-xs text-chrome-neutral-400 mt-0.5">
                  {getString('settings_check_for_updates_desc', appMetadata?.version ?? unknown())}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleCheckForUpdates} disabled={checkingUpdate}>
                <RefreshCw size={14} className={checkingUpdate ? 'animate-spin' : undefined} />
                {checkingUpdate ? getString('settings_checking') : getString('settings_check_for_updates')}
              </Button>
            </div>
            <div className="border-t border-chrome-neutral-800/50" />
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex-1 min-w-0 mr-4">
                <div className="text-sm font-medium text-chrome-neutral-200">{getString('settings_auto_update')}</div>
                <div className="text-xs text-chrome-neutral-400 mt-0.5">{getString('settings_auto_update_desc')}</div>
              </div>
              <ToggleSwitch checked={autoCheck} onChange={(value) => void setAutoCheck(value)} />
            </div>
          </>
        )}
      </SettingsGroup>

      <SettingsGroup title={getString('settings_group_contact')}>
        <LinkRow icon={<Globe size={16} />} label={getString('settings_website')} value="riyazulislam.dev" href="https://riyazulislam.dev" />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<GithubIcon />} label={getString('settings_github')} value="Niczzxo/aello-desktop" href="https://github.com/Niczzxo/Aello-Desktop" />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<User size={16} />} label={getString('settings_creator')} value="Niczzxo" href="https://github.com/Niczzxo" />
      </SettingsGroup>

      <SettingsGroup title={getString('settings_group_legal')}>
        <LinkRow icon={<Scale size={16} />} label={getString('settings_license')} value="GPL-3.0" />
        <div className="border-t border-chrome-neutral-800/50" />
        <div className="px-5 py-4">
          <p className="text-xs text-chrome-neutral-400 leading-relaxed">{getString('settings_license_text')}</p>
        </div>
      </SettingsGroup>

      <SettingsGroup title={getString('settings_group_device')}>
        <LinkRow icon={<Monitor size={16} />} label={getString('settings_platform')} value={systemMetadata?.platform ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Monitor size={16} />} label={getString('settings_os')} value={systemMetadata ? `${systemMetadata.osType} ${systemMetadata.osVersion}` : unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Cpu size={16} />} label={getString('settings_os_family')} value={systemMetadata?.family ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Cpu size={16} />} label={getString('settings_architecture')} value={systemMetadata?.arch ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Globe size={16} />} label={getString('settings_locale')} value={systemMetadata?.locale ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Monitor size={16} />} label={getString('settings_display')} value={systemMetadata?.display ?? unknown()} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Info size={16} />} label={getString('settings_metadata_source')} value={sourceLabel(systemMetadata?.source)} />
        <div className="border-t border-chrome-neutral-800/50" />
        <LinkRow icon={<Cpu size={16} />} label={getString('settings_user_agent')} value={systemMetadata?.userAgent ?? unknown()} />
      </SettingsGroup>
    </div>
  );
}
