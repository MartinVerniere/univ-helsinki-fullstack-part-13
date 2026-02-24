import { describe, it, before } from 'node:test';
import { ok, strictEqual } from 'node:assert';
import axios from 'axios';
import { baseUrl, resetAndSeed } from './helper.js';

let testData;

before(async () => {
	testData = await resetAndSeed();
})

describe('Blogs API', () => {
	it('blogs are returned as json and initially empty', async () => {
		const response = await axios.get(`${baseUrl}/blogs`)
		ok([200, 201].includes(response.status))
		strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
		strictEqual(Array.isArray(response.data), true)
		strictEqual(response.data.length, 0)
	})

	it('a valid blog can be added with authentication', async () => {
		const newBlog = {
			title: 'Test Blog Post',
			author: 'Test Author',
			url: 'https://example.com/test-blog'
		}

		const response = await axios.post(`${baseUrl}/blogs`, newBlog, {
			headers: { Authorization: `Bearer ${testData.tokens[0]}` }
		})

		ok([200, 201].includes(response.status))
		strictEqual(response.data.title, newBlog.title)
		strictEqual(response.data.author, newBlog.author)
		strictEqual(response.data.url, newBlog.url)
		strictEqual(response.data.likes, 0)
	})

	it('created blog appears in blogs list', async () => {
		const response = await axios.get(`${baseUrl}/blogs`)
		strictEqual(response.data.length, 1)
		strictEqual(response.data[0].title, 'Test Blog Post')
	})

	it('blog can be updated', async () => {
		const blogsResponse = await axios.get(`${baseUrl}/blogs`)
		const blogId = blogsResponse.data[0].id

		const response = await axios.put(`${baseUrl}/blogs/${blogId}`, {
			likes: 5
		})

		ok([200, 201].includes(response.status))
		strictEqual(response.data.likes, 5)
	})
})

describe('Users API', () => {
	it('all users are returned', async () => {
		const response = await axios.get(`${baseUrl}/users`)
		ok([200, 201].includes(response.status))
		strictEqual(Array.isArray(response.data), true)
		strictEqual(response.data.length, 2)
	})

	it('users have correct properties', async () => {
		const response = await axios.get(`${baseUrl}/users`)
		const user = response.data[0]

		ok(user.id)
		ok(user.username)
		ok(user.name)
		strictEqual(Array.isArray(user.blogs), true)
	})
})

describe('Authors API', () => {
	it('returns author statistics', async () => {
		const response = await axios.get(`${baseUrl}/authors`)
		ok([200, 201].includes(response.status))
		strictEqual(Array.isArray(response.data), true)
	})

	it('author stats have correct structure', async () => {
		const response = await axios.get(`${baseUrl}/authors`)

		if (response.data.length > 0) {
			const author = response.data[0]
			ok(author.author)
			ok(!isNaN(Number(author.blogs)))
			ok(!isNaN(Number(author.likes)))
			ok(Number(author.blogs) >= 0)
			ok(Number(author.likes) >= 0)
		}
	})
})
