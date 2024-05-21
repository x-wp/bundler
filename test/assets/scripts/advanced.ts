import AWN from 'awesome-notifications';

function testPromise(): Promise<boolean> {
  new AWN();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}

document.addEventListener('DOMContentLoaded', async () => await testPromise());
