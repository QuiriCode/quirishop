CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    username VARCHAR(255),
    password TEXT,
    phone VARCHAR(50),
    emailaddress VARCHAR(255),
    name VARCHAR(255),
    surname VARCHAR(255),
    userprofileid INTEGER,
    profileimageid INTEGER
);


CREATE TABLE IF NOT EXISTS supporttickets (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    orderid INTEGER,
    status VARCHAR(50),
    responsibleuserid INTEGER,
    customeruserid INTEGER
);


CREATE TABLE IF NOT EXISTS supportticketconversations (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    supprtticketid INTEGER,
    senderuserid INTEGER,
    receiveruserid INTEGER,
    ipaddress VARCHAR(50),
    location VARCHAR(255),
    message TEXT,
    messagetimestamp TIMESTAMP,
    readyn BOOLEAN,
    readtimestamp TIMESTAMP
);


CREATE TABLE IF NOT EXISTS externalsupporttickets (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    name VARCHAR(255),
    surname VARCHAR(255),
    emailaddress VARCHAR(255),
    phone VARCHAR(50),
    description TEXT,
    ipaddress VARCHAR(50),
    browser VARCHAR(255),
    device VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS userprofile (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    name VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS userprofileroles (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    userprofileid INTEGER,
    roleid INTEGER,
    allowedyn BOOLEAN
);


CREATE TABLE IF NOT EXISTS userroles (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    code VARCHAR(50),
    description TEXT,
    flexcolumn TEXT
);


CREATE TABLE IF NOT EXISTS useraddress (
    id SERIAL PRIMARY KEY,
    userid INTEGER,
    title VARCHAR(255),
    name VARCHAR(255),
    addressfreetext TEXT,
    street VARCHAR(255),
    zipcode VARCHAR(50),
    housenr VARCHAR(50),
    aptname VARCHAR(255),
    floor VARCHAR(50),
    city VARCHAR(255),
    country VARCHAR(255),
    phone VARCHAR(50),
    secondphone VARCHAR(50),
    emailaddress VARCHAR(255),
    otherinformation TEXT,
    latitude DECIMAL,
    longitude DECIMAL
);


CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    mastercouponid INTEGER,
    productid INTEGER,
    activeyn BOOLEAN,
    appliedyn BOOLEAN
);




CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    selleruserid INTEGER,
    barcode VARCHAR(255),
    name VARCHAR(255),
    brandid INTEGER,
    cargofree BOOLEAN,
    price DECIMAL,
    discountpercentage DECIMAL,
    taxpercentage DECIMAL,
    saleprice DECIMAL,
    gender VARCHAR(50),
    newyn BOOLEAN,
    shortdescription TEXT,
    fulldescription TEXT,
    technicaldetails TEXT,
    productdetails TEXT,
    instagramurl VARCHAR(255),
    youtubeurl VARCHAR(255),
    twitterurl VARCHAR(255),
    facebookurl VARCHAR(255),
    linkedinurl VARCHAR(255),
    deletedyn BOOLEAN,
    hiddenyn BOOLEAN,
    confirmedyn BOOLEAN,
    fastdeliveryn BOOLEAN
);


CREATE TABLE IF NOT EXISTS useractivitylogs (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    userid INTEGER,
    actiontype VARCHAR(255),
    productid INTEGER,
    actiontimestamp TIMESTAMP,
    sessionid VARCHAR(255),
    deviceinfo TEXT,
    location VARCHAR(255),
    ipaddress VARCHAR(50),
    latitude DECIMAL,
    longitude DECIMAL,
    additionalinfo TEXT
);


CREATE TABLE IF NOT EXISTS userfavorites (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    userid INTEGER,
    productid INTEGER,
    discountnotificationyn BOOLEAN,
    stocknotificationyn BOOLEAN,
    newarrivednotificationyn BOOLEAN
);


CREATE TABLE IF NOT EXISTS desktopnotifications (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    userid INTEGER,
    imageid INTEGER,
    acknowledgeyn BOOLEAN,
    acknowledgetimestamp TIMESTAMP,
    clickedyn BOOLEAN,
    clicktimestamp TIMESTAMP,
    redirecturl VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    name VARCHAR(255),
    redirecturl VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS mastercoupons (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    name VARCHAR(255),
    amount DECIMAL,
    productid INTEGER,
    type VARCHAR(50),
    icon VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    productid INTEGER,
    variationid INTEGER,
    sizeid INTEGER,
    ordereruserid INTEGER,
    quantity INTEGER,
    paymentamount DECIMAL,
    status VARCHAR(50),
    deliveryaddressid INTEGER,
    ordernote TEXT,
    canreviewyn BOOLEAN,
    cancelledyn BOOLEAN,
    cancelticketid INTEGER,
    cancelreason TEXT,
    reviewedyn BOOLEAN,
    reviewid INTEGER
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    productid INTEGER,
    rate INTEGER,
    review TEXT,
    deletedyn BOOLEAN,
    confirmedyn BOOLEAN,
    parentreviewid INTEGER
);


CREATE TABLE IF NOT EXISTS reviewthumbs (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    reviewid INTEGER,
    thumbuserid INTEGER,
    helpfulyn INTEGER
);


CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    orderid INTEGER,
    paymentamount NUMERIC,
    paymentmethod VARCHAR(100),
    paymentdate TIMESTAMP,
    transactionid VARCHAR(255),
    request TEXT,
    response TEXT,
    status VARCHAR(100),
    ipaddress VARCHAR(255),
    billinguserid INTEGER,
    billingidentityno VARCHAR(50),
    billingname VARCHAR(255),
    billingsurname VARCHAR(255),
    billingaddress TEXT,
    billingstreet VARCHAR(255),
    billinghousenr VARCHAR(50),
    billingaddressfreetext TEXT,
    billingzipcode VARCHAR(20),
    billingtaxno VARCHAR(50),
    paymentapprovalyn BOOLEAN,
    cancelledyn BOOLEAN,
    cancelreason TEXT
);


CREATE TABLE IF NOT EXISTS shippinginfo (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    orderid INTEGER,
    status VARCHAR(100),
    estimateddeparturedatetime TIMESTAMP,
    departuredatetime TIMESTAMP,
    deliverydatetime TIMESTAMP,
    estimateddeliverydatetime TIMESTAMP,
    cargocarrierid INTEGER,
    productid INTEGER,
    externaltrackingid VARCHAR(255),
    shippingcost NUMERIC,
    shippingaddressid INTEGER
);



CREATE TABLE IF NOT EXISTS usersessions (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    userid INTEGER,
    sessionstart TIMESTAMP,
    sessionend TIMESTAMP,
    ipaddress VARCHAR(50),
    deviceinfo TEXT,
    location VARCHAR(255),
    sessiontoken VARCHAR(255),
    activeyn BOOLEAN
);


CREATE TABLE IF NOT EXISTS cargocarrier (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    name VARCHAR(255),
    phone VARCHAR(50),
    iconimageid INTEGER,
    logoimageid INTEGER,
    addressid INTEGER
);

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    mastercouponid INTEGER,
    productid INTEGER,
    activeyn BOOLEAN,
    appliedyn BOOLEAN
);


CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    name VARCHAR(255),
    parentcategoryid INTEGER
);


CREATE TABLE IF NOT EXISTS productcategories (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    productid INTEGER,
    categoryid INTEGER
);


CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    name VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS producttags (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    productid INTEGER,
    tagid INTEGER
);


CREATE TABLE IF NOT EXISTS variations (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    productid INTEGER,
    colorid INTEGER,
    filename VARCHAR(255),
    mimetype VARCHAR(50),
    imageurl VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    name VARCHAR(100),
    red INTEGER,
    green INTEGER,
    blue INTEGER,
    hex VARCHAR(7)
);


CREATE TABLE IF NOT EXISTS sizes (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    variationid INTEGER,
    name VARCHAR(50),
    stock INTEGER
);


CREATE TABLE IF NOT EXISTS orderlogs (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    orderid INTEGER,
    status VARCHAR(100),
    description TEXT,
    ordertimestamp TIMESTAMP,
    stockbefore INTEGER,
    stockafter INTEGER,
    useripaddress VARCHAR(255),
    userbrowser VARCHAR(255),
    userdevice VARCHAR(255),
    actiontype VARCHAR(100),
    productid INTEGER,
    variationid INTEGER,
    sizeid INTEGER,
    paymentid INTEGER
);


CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    productid INTEGER,
    highlightid INTEGER,
    brandid INTEGER,
    reviewid INTEGER,
    filename VARCHAR(255),
    mimetype VARCHAR(50),
    imageurl VARCHAR(255),
    type VARCHAR(20)
);


CREATE TABLE IF NOT EXISTS highlights (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    productid INTEGER,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    redirecturl VARCHAR(255),
    sortnumber INTEGER,
    activeyn BOOLEAN
);


CREATE TABLE IF NOT EXISTS appsettings (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    dataorigin VARCHAR(255),
    settingkey VARCHAR(255),
    settingvalue TEXT
);

CREATE TABLE IF NOT EXISTS foodpool (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    imageid INTEGER,
    targetprice NUMERIC,
    targetkg NUMERIC,
    type VARCHAR(50),
    completedyn BOOLEAN,
    cancelledyn BOOLEAN,
    deletedyn BOOLEAN
);


CREATE TABLE IF NOT EXISTS foodpooldonations (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    userid INTEGER,
    orderid INTEGER,
    couponid INTEGER,
    donationtimestamp TIMESTAMP,
    approvedyn BOOLEAN,
    cancelledyn BOOLEAN,
    donationamount NUMERIC
);


CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    title VARCHAR(255),
    htmlcontent TEXT,
    imageid INTEGER,
    facebookurl VARCHAR(255),
    twitterurl VARCHAR(255),
    instagramurl VARCHAR(255),
    linkedinurl VARCHAR(255),
    youtubeurl VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS blogtags (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    blogid INTEGER,
    tagid INTEGER
);


CREATE TABLE IF NOT EXISTS blogcategories (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    blogid INTEGER,
    categoryid INTEGER
);


CREATE TABLE IF NOT EXISTS shoppingcart (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    carttoken VARCHAR(255),
    userid INTEGER,
    status VARCHAR(100),
    deletedyn BOOLEAN,
    activeyn BOOLEAN,
    couponid INTEGER
);


CREATE TABLE IF NOT EXISTS shoppingcartdetails (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    userid INTEGER,
    productid INTEGER,
    variationid INTEGER,
    sizeid INTEGER,
    shoppingcartid INTEGER,
    quantity INTEGER,
    totaldiscount NUMERIC,
    finalprice NUMERIC,
    addeddatetime TIMESTAMP,
    deletedyn BOOLEAN,
    couponid INTEGER
);


CREATE TABLE IF NOT EXISTS shoppingcartactions (
    id SERIAL PRIMARY KEY,
    provisionerseq INTEGER,
    createtimestamp TIMESTAMP,
    createuser VARCHAR(255),
    updatetimestamp TIMESTAMP,
    updateuser VARCHAR(255),
    userid INTEGER,
    action VARCHAR(100),
    shoppingcartid INTEGER,
    ipaddress VARCHAR(255)
);

