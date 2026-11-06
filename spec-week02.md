# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:
    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:
    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

### Goal
The API must retrieve author data through CRUD operations. Each author has an id, name, and birth year. Books maintain their relationship to authors through `authorId`.

### Data Model
Required author fields:
- `id`: string, required, custom id such as `a1`
- `authorName`: string, required
- `bornYear`: number, required

### Relationship
Each book will use an `authorId` field to link to an author. The value of `authorId` must match the `id` of an existing author.

When creating or updating a book, the API will return `400` if the submitted `authorId` does not belong to an existing author.

An author cannot be deleted while one or more books reference that author’s `id`. The API will return `409 Conflict` in that case.

## Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects, or an empty array if no authors exist

Errors:
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by custom id.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:
    {
      "id": "a3",
      "authorName": "Maria Santos",
      "bornYear": 1942
    }

Success:
- Status code: `201`
- Response body: the newly created author object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if `bornYear` is invalid or in the future
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:
    {
      "authorName": "Maria Santos",
      "bornYear": 1942
    }

Success:
- Status code: `200`
- Response body: the updated author object

Errors:
- `400` if a required field is missing
- `400` if `bornYear` is invalid or in the future
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no author exists with that id
- `409` if one or more books reference that author's id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every author route so that all five author routes can be understood and tested in the browser.

### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

## Evaluation of Version 1

### Bugs or short-sighted decisions
- Version 1 did not define validation rules for the format of `id`, `authorId`, `publicationDate`, or `bornYear`.
- A client must not be able to change a resource's custom `id` through a `PUT` request. The route parameter is the authoritative id.
- Error responses did not have a consistent JSON format, which would make the API harder for clients to use.
- The relationship check when deleting an author needed a defined response body in addition to the `409` status.

### Security considerations
- Create and update routes must accept only the documented fields and reject malformed data.
- Validation must run before database writes. Database connection strings and other secrets must remain in environment variables and never be included in Swagger examples or committed to Git.

### Efficiency considerations
- The `id` field in both collections should have a unique database index because routes query by that field.
- `books.authorId` should have an index because it is used to validate book requests and to determine whether an author can be deleted.

### Clarifications added for Version 2
- All errors return JSON in the form `{ "error": "descriptive message" }`.
- `PUT` replaces the mutable fields and requires all of them; it does not accept `id` in the request body.
- Dates use the `YYYY-MM-DD` format, and years must be valid integers that are not in the future.

# Books API Week 02 Spec - Version 2

## Feature 1: Book CRUD Operations and Author References

### Goal
Store books with an author reference and provide documented, validated CRUD routes that can be tested through Swagger.

### Data Model and Validation
Book documents are stored in the `books` collection.
- `id`: required non-empty string; custom identifier such as `b1`; unique.
- `authorId`: required non-empty string; must equal the `id` of an existing author.
- `title`: required non-empty string.
- `publicationDate`: required valid date string in `YYYY-MM-DD` format.

The API uses custom `id` values in URL parameters, not MongoDB `_id` values. A unique index must exist on `books.id`, and an index must exist on `books.authorId`.

### Routes

#### GET /books
Returns `200` and an array of book objects. Returns `500` with an error object for an unexpected server or database error.

#### GET /books/:id
Returns `200` and the matching book object. Returns `404` with `{ "error": "Book not found" }` when no matching custom id exists, or `500` for an unexpected error.

#### POST /books
Accepts all required book fields. Returns `201` and the created book. Returns `400` for missing, invalid, or extra fields; a duplicate `id`; or an `authorId` that does not reference an existing author. Returns `500` for an unexpected error.

#### PUT /books/:id
Accepts exactly `authorId`, `title`, and `publicationDate`; all are required. The `id` in the URL is authoritative and cannot be changed in the request body. Returns `200` and the updated book. Returns `400` for invalid or missing fields, extra fields, or an unknown `authorId`; `404` when the book does not exist; and `500` for an unexpected error.

#### DELETE /books/:id
Returns `204` with no response body when the book is deleted. Returns `404` with an error object when it does not exist, or `500` for an unexpected error.

### Swagger and Deployment
Swagger documents every route, parameter, request body, success response, and error response. The routes work locally and in the Render deployment, where `/api-docs` allows browser-based testing.

## Feature 2: Author CRUD Operations

### Goal
Store authors and provide documented, validated CRUD routes while preserving the book-to-author relationship.

### Data Model and Validation
Author documents are stored in the `authors` collection.
- `id`: required non-empty string; custom identifier such as `a1`; unique.
- `authorName`: required non-empty string.
- `bornYear`: required integer; must not be in the future.

The API uses custom `id` values in URL parameters, not MongoDB `_id` values. A unique index must exist on `authors.id`.

### Routes

#### GET /authors
Returns `200` and an array of author objects, including an empty array when none exist. Returns `500` with an error object for an unexpected server or database error.

#### GET /authors/:id
Returns `200` and the matching author object. Returns `404` with `{ "error": "Author not found" }` when no matching custom id exists, or `500` for an unexpected error.

#### POST /authors
Accepts exactly `id`, `authorName`, and `bornYear`. Returns `201` and the created author. Returns `400` for missing, invalid, or extra fields; duplicate `id`; or a future/non-integer `bornYear`. Returns `500` for an unexpected error.

#### PUT /authors/:id
Accepts exactly `authorName` and `bornYear`; both are required. The URL id is authoritative and cannot be changed in the request body. Returns `200` and the updated author. Returns `400` for missing, invalid, or extra fields; `404` when the author does not exist; and `500` for an unexpected error.

#### DELETE /authors/:id
Before deleting, the API checks whether one or more books reference the author's id. It returns `204` with no body when deletion succeeds. It returns `409` with `{ "error": "Author cannot be deleted while books reference it" }` when referenced books exist, `404` when the author does not exist, and `500` for an unexpected error.

### Swagger and Deployment
Swagger documents every author route, parameter, request body, success response, and error response. The routes work locally and in the Render deployment, where `/api-docs` allows browser-based testing.

