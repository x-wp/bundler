import AWN from 'awesome-notifications';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import XHR from '@uppy/xhr-upload';

function testPromise(): Promise<boolean> {
  const awn = new AWN();


  return new Promise((resolve) => {
    setTimeout(() => {
      awn.modal('aaa');
      resolve(true);
    }, 1000);
  });
}


// document.addEventListener('DOMContentLoaded', async () => await testPromise());
document.addEventListener('DOMContentLoaded', () => {
  const uppy = new Uppy({
    debug: true,
    autoProceed: true,
    meta: {
      action: 'wcr_upload_package',
    },
    restrictions: {
      maxNumberOfFiles: 1,
      minNumberOfFiles: 1,
      allowedFileTypes: [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-compressed',
        'multipart/x-zip',
      ],
    },
  })
    .use(Dashboard, {
      trigger: '.uppy-trg',
      // hideProgressAfterFinish: true,
      disableThumbnailGenerator: true,
      showProgressDetails: true,
      animateOpenClose: true,
      showSelectedFiles: false,
      doneButtonHandler: () => {
        uppy.cancelAll();
        uppy.close();
      },
      // closeAfterFinish: true,
    })
    .use(XHR, {
      endpoint: '/end',
      fieldName: 'archive',
      headers: {
        'X-WP-Nonce': 'aaa',
        Accept: 'application/json',
      },
    });
})
