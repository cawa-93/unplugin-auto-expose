import { app, BrowserWindow } from 'electron';
import { join } from 'path';



/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
export async function restoreOrCreateWindow() {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (window === undefined) {
        window = new BrowserWindow({
            webPreferences: {
                preload: join(__dirname, '../../preload/dist/index.js'), // path to compiled preload
            },
        });
        console.log({VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL});
        await window.loadURL(process.env.VITE_DEV_SERVER_URL); // Vite dev server for renderer
    }

    if (window.isMinimized()) {
        window.restore();
    }

    window.focus();
}



/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * @see https://www.electronjs.org/docs/v14-x-y/api/app#event-activate-macos Event: 'activate'
 */
app.on('activate', restoreOrCreateWindow);


/**
 * Create app window when background process will be ready
 */
app.whenReady()
    .then(restoreOrCreateWindow)
    .catch((e) => console.error('Failed create window:', e));
