exports.successResponse = (res, data = null, message = "Success", code = 200) => {
  return res.status(code).json({
    status: true,
    code,
    message,
    data,
  });
};

exports.errorResponse = (res, message = "Something went wrong", code = 500, errors = null) => {
  return res.status(code).json({
    status: false,
    code,
    message,
    errors,
  });
};

exports. getPagination = (page, perPage, totalRecords) => {
    page = parseInt(page, 10); 
    const totalPages = Math.ceil(totalRecords / perPage);  
    const nextPage = page < totalPages ? page + 1 : null; 
    const prevPage = page > 1 ? page - 1 : null; 
  
    return {
        total_records: totalRecords, 
        total_pages: totalPages, 
        current_page: page,  
        per_page: perPage,  
        range_from: `Showing ${(page - 1) * perPage + 1}-${Math.min(page * perPage, totalRecords)} of ${totalRecords} entries`,  // Entry range for current page
        next_page: nextPage,  
        prev_page: prevPage, 
    };
};
