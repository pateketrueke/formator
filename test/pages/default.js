export default {
  url(path) {
    return `${process.env.BASE_URL}${path ? `/${path}` : ''}`;
  },
};
