package com.fintrack.controller;

import com.fintrack.model.Account;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @GetMapping
    public ResponseEntity<?> getAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(accountService.getAccounts(getUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<?> createAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        try {
            Long userId = getUserId(userDetails);
            String name = (String) body.get("name");
            Account.AccountType type = Account.AccountType.valueOf(body.get("type").toString());
            BigDecimal balance = body.get("balance") != null ?
                    new BigDecimal(body.get("balance").toString()) : BigDecimal.ZERO;
            String currency = (String) body.getOrDefault("currency", "USD");
            String color = (String) body.get("color");

            return ResponseEntity.ok(accountService.createAccount(userId, name, type, balance, currency, color));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        try {
            Long userId = getUserId(userDetails);
            return ResponseEntity.ok(accountService.updateAccount(
                    id, userId,
                    (String) body.get("name"),
                    (String) body.get("color"),
                    (String) body.get("currency")
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            accountService.deleteAccount(id, getUserId(userDetails));
            return ResponseEntity.ok(Map.of("message", "Account deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
