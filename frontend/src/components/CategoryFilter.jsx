import React from 'react';

function CategoryFilter({ categories = [], category, handleCategoryChange }) {
    const categoryList = Array.isArray(categories) ? categories : [];
    
    return (
        <div className="category-filter">
            <select 
                className="form-select" 
                value={category || ''} 
                onChange={(e) => handleCategoryChange(e.target.value)}
            >
                {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default CategoryFilter;