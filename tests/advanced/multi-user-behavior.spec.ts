import { test, expect } from '../../src/fixtures';
import { TestUsers } from '../../src/utils/test-data';

test.describe('Multi-User Behavior & Defect Detection', () => {
  test.describe('Standard User — Baseline', () => {
    test(
      'should have all unique product images (visual integrity check)',
      { tag: ['@critical', '@regression'] },
      async ({ loginPage, inventoryPage }) => {
        await test.step('Login as standard user', async () => {
          await loginPage.goto();
          await loginPage.login(TestUsers.standard);
          await inventoryPage.expectPageLoaded();
        });

        await test.step('Collect all product image sources', async () => {
          const sources = await inventoryPage.getProductImageSources();
          expect(sources).toHaveLength(6);

          await test.step('Verify all 6 images are unique (no duplicates)', async () => {
            const uniqueCount = new Set(sources).size;
            expect(uniqueCount).toBe(6);
          });
        });
      }
    );

    test(
      'should have cart persist when navigating between pages',
      { tag: ['@critical', '@regression'] },
      async ({ loginPage, inventoryPage, productDetailPage, cartPage }) => {
        let addedProductName: string;

        await test.step('Login and add 2 products to cart', async () => {
          await loginPage.goto();
          await loginPage.login(TestUsers.standard);
          const names = await inventoryPage.getProductNames();
          addedProductName = names[0];
          await inventoryPage.addProductToCart(names[0]);
          await inventoryPage.addProductToCart(names[1]);
          await inventoryPage.expectCartBadge(2);
        });

        await test.step('Navigate to product detail page', async () => {
          const names = await inventoryPage.getProductNames();
          await inventoryPage.clickProductByName(names[2]);
          await productDetailPage.expectDetailPageVisible();
        });

        await test.step('Go back to inventory — cart badge should still show 2', async () => {
          await productDetailPage.goBackToProducts();
          await inventoryPage.expectCartBadge(2);
        });

        await test.step('Navigate to cart — both items should still be there', async () => {
          await inventoryPage.navigateToCart();
          await cartPage.expectItemCount(2);
          await cartPage.expectItemInCart(addedProductName!);
        });
      }
    );

    test(
      'should persist cart items across logout and re-login (localStorage-based session)',
      { tag: ['@critical', '@regression'] },
      async ({ loginPage, inventoryPage, cartPage }) => {
        await test.step('Login and add 3 products to cart', async () => {
          await loginPage.goto();
          await loginPage.login(TestUsers.standard);
          await inventoryPage.addFirstNProductsToCart(3);
          await inventoryPage.expectCartBadge(3);
        });

        await test.step('Logout', async () => {
          await inventoryPage.logout();
          await loginPage.expectLoginPageVisible();
        });

        await test.step('Re-login as the same user', async () => {
          await loginPage.login(TestUsers.standard);
          await inventoryPage.expectPageLoaded();
        });

        await test.step('Verify cart persists after re-login — SauceDemo stores cart in localStorage', async () => {
          await inventoryPage.expectCartBadge(3);
          await inventoryPage.navigateToCart();
          await cartPage.expectItemCount(3);
        });

        await test.step('Confirm only Reset App State can clear the cart (not logout)', async () => {
          await inventoryPage.goToAllItems();
          await inventoryPage.resetAppState();
          await inventoryPage.expectCartBadge(0);
        });
      }
    );
  });

  test.describe('Problem User — Defect Detection', () => {
    test(
      'should detect duplicate product images (known visual defect)',
      { tag: ['@critical', '@regression'] },
      async ({ loginPage, inventoryPage }) => {
        await test.step('Login as problem user', async () => {
          await loginPage.goto();
          await loginPage.login(TestUsers.problem);
          await inventoryPage.expectPageLoaded();
        });

        await test.step('Collect all product image sources', async () => {
          const sources = await inventoryPage.getProductImageSources();
          expect(sources).toHaveLength(6);

          await test.step(
            'Detect that problem_user sees duplicate images — all images are identical (known defect)',
            async () => {
              const uniqueCount = new Set(sources).size;
              expect(uniqueCount).toBeLessThan(6);
            }
          );
        });
      }
    );

    test(
      'should still display the correct number of products despite broken UI',
      { tag: '@regression' },
      async ({ loginPage, inventoryPage }) => {
        await test.step('Login as problem user', async () => {
          await loginPage.goto();
          await loginPage.login(TestUsers.problem);
        });

        await test.step('Verify all 6 products are listed (layout is intact)', async () => {
          const count = await inventoryPage.getProductCount();
          expect(count).toBe(6);
        });

        await test.step('Verify product names are still displayed', async () => {
          const names = await inventoryPage.getProductNames();
          expect(names).toHaveLength(6);
          names.forEach((name) => expect(name.length).toBeGreaterThan(0));
        });
      }
    );
  });

  test.describe('Performance Glitch User — Performance Measurement', () => {
    test(
      'should complete login within 15 seconds despite intentional performance delay',
      { tag: ['@critical', '@regression'] },
      async ({ loginPage, inventoryPage }) => {
        let loginDurationMs: number;

        await test.step('Start the login timer and submit credentials', async () => {
          await loginPage.goto();
          const start = Date.now();
          await loginPage.login(TestUsers.performance);
          await inventoryPage.expectPageLoaded();
          loginDurationMs = Date.now() - start;
        });

        await test.step('Verify login completed (performance glitch user can still login)', async () => {
          await inventoryPage.expectPageLoaded();
        });

        await test.step('Verify login took longer than normal (glitch is present) but is under 15s', async () => {
          expect(loginDurationMs!).toBeGreaterThan(1_000);
          expect(loginDurationMs!).toBeLessThan(15_000);
        });
      }
    );

    test(
      'should have all 6 products visible after slow login',
      { tag: '@regression' },
      async ({ loginPage, inventoryPage }) => {
        await test.step('Login as performance glitch user', async () => {
          await loginPage.goto();
          await loginPage.login(TestUsers.performance);
          await inventoryPage.expectPageLoaded();
        });

        await test.step('Verify products load correctly despite slow session', async () => {
          const count = await inventoryPage.getProductCount();
          expect(count).toBe(6);
        });
      }
    );
  });
});
