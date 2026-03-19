import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPage } from '../SettingsPage';

vi.stubGlobal('alert', vi.fn());

describe('SettingsPage', () => {
    it('renders profile and system sections', () => {
        render(<SettingsPage />);
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.getByText('System Preferences')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
    });

    it('toggles appearance', () => {
        render(<SettingsPage />);
        const themeBtn = screen.getByText('Dark');
        fireEvent.click(themeBtn);
        expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('toggles checkboxes', () => {
        render(<SettingsPage />);
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBe(2);
        
        checkboxes.forEach(cb => {
            expect(cb.checked).toBe(true);
            fireEvent.click(cb);
            expect(cb.checked).toBe(false);
        });
    });

    it('handles save', () => {
        render(<SettingsPage />);
        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);
        expect(global.alert).toHaveBeenCalledWith('Settings saved successfully!');
    });
});
