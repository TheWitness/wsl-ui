import { setupHooks, actions } from '../base';
import { selectors, setMockDownload, switchToMainWindow, waitForDialogToDisappear } from '../utils';

describe('Distribution names with spaces', () => {
  setupHooks.standard();

  it('creates, clones, and renames distributions with interior spaces', async () => {
    await setMockDownload(100);
    await $(selectors.newDistroButton).click();
    await $(selectors.newDistroTabDownload).waitForClickable();
    await $(selectors.newDistroTabDownload).click();
    const dialog = await $(selectors.dialog);
    const url = await dialog.$('input[placeholder*="https://"]');
    await url.waitForDisplayed();
    await url.setValue('https://example.com/release-test.tar.gz');
    const useUrl = await dialog.$('button*=Use URL');
    await useUrl.waitForClickable();
    await useUrl.click();
    await $(selectors.installConfigNameInput).waitForDisplayed();
    await $(selectors.installConfigNameInput).setValue('Release Test');
    await $(selectors.installConfigConfirmButton).waitForClickable({ timeout: 5000 });
    await $(selectors.installConfigConfirmButton).click();
    await waitForDialogToDisappear(selectors.dialog, 20000);
    await expect($(selectors.distroCardByName('Release Test'))).toBeDisplayed();

    await actions.openCloneDialog('Release Test');
    await $(selectors.cloneNameInput).setValue('Release Clone');
    await $(selectors.cloneConfirmButton).waitForClickable({ timeout: 5000 });
    await $(selectors.cloneConfirmButton).click();
    await waitForDialogToDisappear(selectors.cloneDialog, 15000);
    await switchToMainWindow();
    await expect($(selectors.distroCardByName('Release Clone'))).toBeDisplayed();
    await expect($(selectors.distroCardByName('Release Test'))).toBeDisplayed();

    await actions.openRenameDialog('Release Test');
    await $(selectors.renameNameInput).setValue('Release Renamed');
    await $(selectors.renameConfirmButton).waitForClickable({ timeout: 5000 });
    await $(selectors.renameConfirmButton).click();
    await waitForDialogToDisappear(selectors.renameDialog, 15000);
    await switchToMainWindow();
    await expect($(selectors.distroCardByName('Release Renamed'))).toBeDisplayed();
    await expect($(selectors.distroCardByName('Release Test'))).not.toBeExisting();
  });
});
