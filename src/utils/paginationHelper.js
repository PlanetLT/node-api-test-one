// utils/paginationHelper.js

export const paginate = ({ total, page = 1, limit = 10 }) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
};
