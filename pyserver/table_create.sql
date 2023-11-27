CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) CHECK (price >= 0),
    discount NUMERIC(10, 2) CHECK (discount >= 0 AND discount <= 100),
    new BOOLEAN NOT NULL,
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    saleCount INT CHECK (saleCount >= 0),
    shortDescription TEXT,
    fullDescription TEXT,
    instagramurl VARCHAR(255),
    youtubeurl VARCHAR(255),
    twitterurl VARCHAR(255),
    facebookurl VARCHAR(255),
    linkedinurl VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS productcategories (
    productid INT REFERENCES products(id) ON DELETE CASCADE,
    categoryid INT REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (productid, categoryid)
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS producttags (
    productid INT REFERENCES products(id) ON DELETE CASCADE,
    tagid INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (productid, tagid)
);

CREATE TABLE IF NOT EXISTS variations (
    id SERIAL PRIMARY KEY,
    productid INT REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(255) NOT NULL,
    base64content BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS sizes (
    id SERIAL PRIMARY KEY,
    variationid INT REFERENCES variations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stock INT CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS productimages (
    id SERIAL PRIMARY KEY,
    productid INT REFERENCES products(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(255) NOT NULL,
    base64content BYTEA NOT NULL
);
