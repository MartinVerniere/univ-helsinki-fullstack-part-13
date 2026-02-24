import { describe, it, before, after } from 'node:test';
import { ok, strictEqual, fail, notStrictEqual } from 'node:assert';
import { post, get, put, delete as del } from 'axios';
import { baseUrl, resetAndSeed, createUser, login } from './helper.js';


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Shared test data for all tests in this file
let testData;
let createdBlogId;
let sessionUser;

// Single setup for the entire test file
before(async () => {
	testData = await resetAndSeed();

	// Create session user
	sessionUser = await createUser('session@example.com', 'Session User', 'sessionpass');

	// Create a blog for reading list tests
	const newBlog = {
		title: 'Test Blog for Reading List',
		author: 'Reading List Author',
		url: 'https://example.com/reading-list-blog'
	};

	const blogResponse = await post(`${baseUrl}/blogs`, newBlog, {
		headers: { Authorization: `Bearer ${testData.tokens[0]}` }
	});
	createdBlogId = blogResponse.data.id;
})

describe('Reading Lists API', () => {
	it('can add a blog to reading list', async () => {
		const readingListEntry = {
			blogId: createdBlogId,
			userId: testData.users[0].id
		};

		const response = await post(`${baseUrl}/readinglists`, readingListEntry);

		ok([200, 201].includes(response.status));
		strictEqual(response.data.blog_id, createdBlogId);
		strictEqual(response.data.user_id, testData.users[0].id);
		strictEqual(response.data.read, false);
	})

	it('cannot add same blog to reading list twice', async () => {
		const readingListEntry = {
			blogId: createdBlogId,
			userId: testData.users[0].id
		};

		try {
			await post(`${baseUrl}/readinglists`, readingListEntry);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 400);
		}
	})

	it('returns 400 when blogId is missing', async () => {
		const readingListEntry = {
			userId: testData.users[0].id
		};

		try {
			await post(`${baseUrl}/readinglists`, readingListEntry);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 400);
		}
	})

	it('returns 400 when userId is missing', async () => {
		const readingListEntry = {
			blogId: createdBlogId
		};

		try {
			await post(`${baseUrl}/readinglists`, readingListEntry);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 400);
		}
	})

	it('returns 404 when blog does not exist', async () => {
		const readingListEntry = {
			blogId: 99999,
			userId: testData.users[0].id
		}

		try {
			await post(`${baseUrl}/readinglists`, readingListEntry);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 404);
		}
	})

	it('returns 404 when user does not exist', async () => {
		const readingListEntry = {
			blogId: createdBlogId,
			userId: 99999
		}

		try {
			await post(`${baseUrl}/readinglists`, readingListEntry);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 404);
		}
	})

	it('user can view their reading list', async () => {
		const response = await get(`${baseUrl}/users/${testData.users[0].id}`)

		ok([200, 201].includes(response.status));
		strictEqual(response.data.name, testData.users[0].name);
		strictEqual(response.data.username, testData.users[0].username);
		ok(Array.isArray(response.data.readings));
		ok(response.data.readings.length > 0);

		const reading = response.data.readings[0];
		ok(reading.id);
		ok(reading.title);
		ok(reading.author);
		ok(reading.url);
		ok(reading.reading_list);
		strictEqual(typeof reading.reading_list.read, 'boolean');
	})

	it('user can filter reading list by read status', async () => {
		const responseUnread = await get(`${baseUrl}/users/${testData.users[0].id}?read=false`);
		ok([200, 201].includes(responseUnread.status));

		const responseRead = await get(`${baseUrl}/users/${testData.users[0].id}?read=true`);
		ok([200, 201].includes(responseRead.status));

		// All readings should be unread at this point
		ok(responseUnread.data.readings.length > 0);
		strictEqual(responseRead.data.readings.length, 0);
	})

	it('user can mark a blog as read with authentication', async () => {
		const userResponse = await get(`${baseUrl}/users/${testData.users[0].id}`);
		const readingListId = userResponse.data.readings[0].reading_list.id;

		const response = await put(
			`${baseUrl}/readinglists/${readingListId}`,
			{ read: true },
			{ headers: { Authorization: `Bearer ${testData.tokens[0]}` } }
		);

		ok([200, 201].includes(response.status));
		strictEqual(response.data.read, true);
	})

	it('marking as read requires authentication', async () => {
		const userResponse = await get(`${baseUrl}/users/${testData.users[0].id}`);
		const readingListId = userResponse.data.readings[0].reading_list.id;

		try {
			await put(
				`${baseUrl}/readinglists/${readingListId}`,
				{ read: false }
			);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 401);
		}
	})

	it('user can only mark their own reading list entries', async () => {
		const userResponse = await get(`${baseUrl}/users/${testData.users[0].id}`);
		const readingListId = userResponse.data.readings[0].reading_list.id;

		try {
			await put(
				`${baseUrl}/readinglists/${readingListId}`,
				{ read: false },
				{ headers: { Authorization: `Bearer ${testData.tokens[1]}` } }
			);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 401);
		}
	})

	it('returns 404 when marking non-existent reading list entry', async () => {
		try {
			await put(
				`${baseUrl}/readinglists/99999`,
				{ read: true },
				{ headers: { Authorization: `Bearer ${testData.tokens[0]}` } }
			);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 404);
		}
	})

	it('verified that blog is now marked as read', async () => {
		const responseRead = await get(`${baseUrl}/users/${testData.users[0].id}?read=true`);
		ok([200, 201].includes(responseRead.status));
		ok(responseRead.data.readings.length > 0);

		const responseUnread = await get(`${baseUrl}/users/${testData.users[0].id}?read=false`);
		ok([200, 201].includes(responseUnread.status));
		strictEqual(responseUnread.data.readings.length, 0);
	})
})

describe('Session Management API', () => {
	let sessionToken

	it('login creates a session', async () => {
		const response = await post(`${baseUrl}/login`, {
			username: 'session@example.com',
			password: 'sessionpass'
		})

		ok([200, 201].includes(response.status));
		ok(response.data.token);
		strictEqual(response.data.username, 'session@example.com');
		strictEqual(response.data.name, 'Session User');
		sessionToken = response.data.token;
	})

	it('authenticated request works with valid session', async () => {
		const newBlog = {
			title: 'Blog with Session',
			author: 'Session Author',
			url: 'https://example.com/session-blog'
		};

		const response = await post(`${baseUrl}/blogs`, newBlog, {
			headers: { Authorization: `Bearer ${sessionToken}` }
		});

		ok([200, 201].includes(response.status));
		strictEqual(response.data.title, newBlog.title);
	})

	it('logout removes user sessions', async () => {
		const response = await del(`${baseUrl}/logout`, {
			headers: { Authorization: `Bearer ${sessionToken}` }
		});

		strictEqual(response.status, 204);
	})

	it('authenticated request fails after logout', async () => {
		const newBlog = {
			title: 'Blog After Logout',
			author: 'Logout Author',
			url: 'https://example.com/logout-blog'
		};

		try {
			await post(`${baseUrl}/blogs`, newBlog, {
				headers: { Authorization: `Bearer ${sessionToken}` }
			});
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 401);
		}
	})

	it('logout without token returns 401', async () => {
		try {
			await del(`${baseUrl}/logout`);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 401);
		}
	})

	it('logout with invalid token returns 401', async () => {
		try {
			await del(`${baseUrl}/logout`, {
				headers: { Authorization: 'Bearer invalidtoken123' }
			});
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 401);
		}
	})

	it('multiple logins create separate sessions', async () => {
		const token1 = await login('session@example.com', 'sessionpass');
		await sleep(1100)
		const token2 = await login('session@example.com', 'sessionpass');

		notStrictEqual(token1, token2);

		const newBlog1 = {
			title: 'Blog with First Token',
			author: 'Token1',
			url: 'https://example.com/token1'
		};

		const response1 = await post(`${baseUrl}/blogs`, newBlog1, {
			headers: { Authorization: `Bearer ${token1}` }
		});
		ok([200, 201].includes(response1.status));

		const newBlog2 = {
			title: 'Blog with Second Token',
			author: 'Token2',
			url: 'https://example.com/token2'
		};

		const response2 = await post(`${baseUrl}/blogs`, newBlog2, {
			headers: { Authorization: `Bearer ${token2}` }
		});
		ok([200, 201].includes(response2.status));
	})

	it('logout removes all sessions for that user', async () => {
		// Previous test created two sessions; logout should remove both
		await sleep(1100);
		const token = await login('session@example.com', 'sessionpass');

		await del(`${baseUrl}/logout`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		const newBlog = {
			title: 'Blog After Mass Logout',
			author: 'Logout All',
			url: 'https://example.com/logout-all'
		};

		try {
			await post(`${baseUrl}/blogs`, newBlog, {
				headers: { Authorization: `Bearer ${token}` }
			});
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 401);
		}
	})

	it('active user can make authenticated requests', async () => {
		await sleep(1100);
		const token = await login('session@example.com', 'sessionpass');

		const newBlog = {
			title: 'Blog for Active User',
			author: 'Active',
			url: 'https://example.com/active'
		};

		const response = await post(`${baseUrl}/blogs`, newBlog, {
			headers: { Authorization: `Bearer ${token}` }
		});

		ok([200, 201].includes(response.status));
	})
})

describe('Integration: Reading Lists and Sessions', () => {
	let integrationBlogId;
	let integrationReadingListId;
	let integrationToken;

	it('create blog and add to reading list', async () => {
		integrationToken = await login('test2@example.com', 'password456');

		const newBlog = {
			title: 'Integration Test Blog',
			author: 'Integration Author',
			url: 'https://example.com/integration'
		};

		const blogResponse = await post(`${baseUrl}/blogs`, newBlog, {
			headers: { Authorization: `Bearer ${integrationToken}` }
		});
		integrationBlogId = blogResponse.data.id;

		const readingListEntry = {
			blogId: integrationBlogId,
			userId: testData.users[1].id
		};

		const response = await post(`${baseUrl}/readinglists`, readingListEntry);

		ok([200, 201].includes(response.status));
		strictEqual(response.data.blog_id, integrationBlogId);
		integrationReadingListId = response.data.id;
	})

	it('can mark blog as read with valid session', async () => {
		const response = await put(
			`${baseUrl}/readinglists/${integrationReadingListId}`,
			{ read: true },
			{ headers: { Authorization: `Bearer ${integrationToken}` } }
		);

		ok([200, 201].includes(response.status));
		strictEqual(response.data.read, true);
	})

	it('cannot mark blog as read after session expires (logout)', async () => {
		await del(`${baseUrl}/logout`, {
			headers: { Authorization: `Bearer ${integrationToken}` }
		});

		try {
			await put(
				`${baseUrl}/readinglists/${integrationReadingListId}`,
				{ read: false },
				{ headers: { Authorization: `Bearer ${integrationToken}` } }
			);
			fail('Should have thrown an error');
		} catch (error) {
			strictEqual(error.response.status, 401);
		}
	})

	it('new session allows access to reading list operations again', async () => {
		await sleep(1100);
		const newToken = await login('test2@example.com', 'password456');

		const response = await put(
			`${baseUrl}/readinglists/${integrationReadingListId}`,
			{ read: false },
			{ headers: { Authorization: `Bearer ${newToken}` } }
		);

		ok([200, 201].includes(response.status));
		strictEqual(response.data.read, false);
	})
})