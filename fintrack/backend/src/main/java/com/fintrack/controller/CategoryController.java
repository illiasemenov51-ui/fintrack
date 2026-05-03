package com.fintrack.controller;

import com.fintrack.model.Category;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @GetMapping
    public ResponseEntity<?> getCategories(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<Category> categories = categoryRepository.findByUserIdOrDefaultCategoryTrue(userId);
        List<Map<String, Object>> result = categories.stream().map(cat -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", cat.getId());
            m.put("name", cat.getName());
            m.put("type", cat.getType());
            m.put("icon", cat.getIcon());
            m.put("color", cat.getColor());
            m.put("isDefault", cat.isDefaultCategory());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        try {
            Long userId = getUserId(userDetails);
            var user = userRepository.findById(userId).orElseThrow();
            Category cat = Category.builder()
                    .name((String) body.get("name"))
                    .type(Category.CategoryType.valueOf(body.get("type").toString()))
                    .icon((String) body.get("icon"))
                    .color((String) body.get("color"))
                    .user(user)
                    .build();
            cat = categoryRepository.save(cat);
            Map<String, Object> m = new HashMap<>();
            m.put("id", cat.getId());
            m.put("name", cat.getName());
            m.put("type", cat.getType());
            m.put("icon", cat.getIcon());
            m.put("color", cat.getColor());
            return ResponseEntity.ok(m);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
