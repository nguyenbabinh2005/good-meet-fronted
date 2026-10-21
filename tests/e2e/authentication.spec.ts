import { expect, test } from '@playwright/test'

// The backend has no JWT: register answers 201 with no body, login answers { userId }.
const API = '**://localhost:8080'

test('redirects a guest from a protected route to sign in', async ({ page }) => {
  await page.goto('/meetings/schedule')

  await expect(page).toHaveURL(/\/login\?redirectTo=%2Fmeetings%2Fschedule$/)
  await expect(page.getByRole('heading', { name: /Sign in to Good Meet|Đăng nhập Good Meet/ })).toBeVisible()
})

test('signs in and returns to the requested protected route', async ({ page }) => {
  await page.route(`${API}/auth/login`, (route) =>
    route.fulfill({ body: JSON.stringify({ userId: 'user-id' }), contentType: 'application/json', status: 200 }),
  )

  await page.goto('/meetings/schedule')
  await page.getByLabel(/Email address|Địa chỉ email/).fill('billy@example.com')
  await page.getByLabel(/^(Password|Mật khẩu)$/).fill('secret1')
  await page.getByRole('button', { name: /^(Sign in|Đăng nhập)$/ }).click()

  await expect(page).toHaveURL(/\/meetings\/schedule$/)
  await expect(page.getByText('billy', { exact: true })).toBeVisible()
})

test('registers, signs in right away and keeps the chosen display name', async ({ page }) => {
  await page.route(`${API}/auth/register`, (route) => {
    expect(route.request().postDataJSON()).toEqual({
      displayName: 'Billy Nguyen',
      email: 'billy@example.com',
      password: 'secret1',
    })
    return route.fulfill({ status: 201 })
  })
  await page.route(`${API}/auth/login`, (route) =>
    route.fulfill({ body: JSON.stringify({ userId: 'new-user-id' }), contentType: 'application/json', status: 200 }),
  )

  await page.goto('/register?redirectTo=%2Fmeetings')
  await page.getByLabel(/^(Display name|Tên hiển thị)$/).fill('Billy Nguyen')
  await page.getByLabel(/Email address|Địa chỉ email/).fill('BILLY@EXAMPLE.COM')
  await page.getByLabel(/^(Password|Mật khẩu)$/).fill('secret1')
  await page.getByLabel(/Confirm password|Xác nhận mật khẩu/).fill('secret1')
  await page.getByRole('button', { name: /Create account|Tạo tài khoản/ }).click()

  await expect(page).toHaveURL(/\/meetings$/)
  await expect(page.getByText('Billy Nguyen')).toBeVisible()
})
