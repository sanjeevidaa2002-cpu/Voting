import { CustomTheme, ThemeSettings } from '../types';

export function applyThemeToDocument(theme: Partial<CustomTheme | ThemeSettings>) {
  if (!theme || typeof document === 'undefined') return;
  const root = document.documentElement;

  if (theme.primaryColor) {
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--color-primary', theme.primaryColor);
  }
  if (theme.secondaryColor) {
    root.style.setProperty('--secondary', theme.secondaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
  }
  if (theme.accentColor) {
    root.style.setProperty('--accent', theme.accentColor);
    root.style.setProperty('--color-accent', theme.accentColor);
  }
  if (theme.backgroundColor) {
    root.style.setProperty('--background', theme.backgroundColor);
    root.style.setProperty('--color-bg', theme.backgroundColor);
  }
  if (theme.cardBackgroundColor) {
    root.style.setProperty('--card', theme.cardBackgroundColor);
    root.style.setProperty('--color-card-bg', theme.cardBackgroundColor);
  }
  if (theme.headerBackgroundColor) {
    root.style.setProperty('--header', theme.headerBackgroundColor);
    root.style.setProperty('--color-header-bg', theme.headerBackgroundColor);
  }
  if (theme.footerBackgroundColor) {
    root.style.setProperty('--footer', theme.footerBackgroundColor);
    root.style.setProperty('--color-footer-bg', theme.footerBackgroundColor);
  }
  if (theme.buttonColor) {
    root.style.setProperty('--button', theme.buttonColor);
    root.style.setProperty('--color-button-bg', theme.buttonColor);
  }
  if (theme.buttonHoverColor) {
    root.style.setProperty('--button-hover', theme.buttonHoverColor);
    root.style.setProperty('--color-button-hover', theme.buttonHoverColor);
  }
  if (theme.textColor) {
    root.style.setProperty('--text', theme.textColor);
    root.style.setProperty('--color-text', theme.textColor);
  }
  if (theme.secondaryTextColor) {
    root.style.setProperty('--text-secondary', theme.secondaryTextColor);
    root.style.setProperty('--color-text-sec', theme.secondaryTextColor);
  }
  if (theme.borderColor) {
    root.style.setProperty('--border', theme.borderColor);
    root.style.setProperty('--color-border', theme.borderColor);
  }
  if (theme.inputBackgroundColor) {
    root.style.setProperty('--input', theme.inputBackgroundColor);
    root.style.setProperty('--color-input-bg', theme.inputBackgroundColor);
  }
  if (theme.modalBackgroundColor) {
    root.style.setProperty('--modal', theme.modalBackgroundColor);
    root.style.setProperty('--color-modal-bg', theme.modalBackgroundColor);
  }
  if (theme.successColor) {
    root.style.setProperty('--success', theme.successColor);
    root.style.setProperty('--color-success', theme.successColor);
  }
  if (theme.warningColor) {
    root.style.setProperty('--warning', theme.warningColor);
    root.style.setProperty('--color-warning', theme.warningColor);
  }
  if (theme.errorColor) {
    root.style.setProperty('--error', theme.errorColor);
    root.style.setProperty('--color-error', theme.errorColor);
  }
  if (theme.borderRadius) {
    root.style.setProperty('--radius', theme.borderRadius);
  }
}
