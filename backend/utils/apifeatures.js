class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            {
              name: {
                $regex: this.queryStr.keyword,
                $options: "i",
              },
            },
            {
              keywords: {
                $regex: this.queryStr.keyword,
                $options: "i",
              },
            },
            {
              _id: this.query.keyword,
            },
          ],
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // removing some fields for "category"
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // filter for price and rating
    let querynew = JSON.stringify(queryCopy);
    querynew = querynew.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(querynew));

    return this;
  }

  pagination(perpage) {
    let currpage = this.queryStr.page || 1;

    let skip = perpage * (currpage - 1);
    this.query = this.query.limit(perpage).skip(skip);

    return this;
  }
  Sort() {
    const { sort } = this.queryStr;
    if (!sort) {
      return this;
    }
    let sortfix = sort.replace(",", " ");
    this.query = this.query.sort(sortfix);
    return this;
  }
}

module.exports = ApiFeatures;
