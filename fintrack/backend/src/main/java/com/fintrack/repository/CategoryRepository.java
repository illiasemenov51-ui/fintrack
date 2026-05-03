package com.fintrack.repository;

import com.fintrack.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrDefaultCategoryTrue(Long userId);
    List<Category> findByUserIdOrDefaultCategoryTrueAndType(Long userId, Category.CategoryType type);
}
