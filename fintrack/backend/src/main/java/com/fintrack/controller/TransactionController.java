package com.fintrack.controller;

import com.fintrack.model.Transaction;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<?> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Long userId = getUserId(userDetails);
        Transaction.TransactionType txType = type != null ?
                Transaction.TransactionType.valueOf(type.toUpperCase()) : null;

        return ResponseEntity.ok(transactionService.getTransactions(
                userId, page, size, txType, categoryId, accountId, startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        try {
            Long userId = getUserId(userDetails);
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            Transaction.TransactionType type = Transaction.TransactionType.valueOf(body.get("type").toString());
            String description = (String) body.get("description");
            String note = (String) body.get("note");
            LocalDateTime date = body.get("transactionDate") != null ?
                    LocalDateTime.parse(body.get("transactionDate").toString()) : null;
            Long accountId = body.get("accountId") != null ?
                    Long.parseLong(body.get("accountId").toString()) : null;
            Long categoryId = body.get("categoryId") != null ?
                    Long.parseLong(body.get("categoryId").toString()) : null;
            Long toAccountId = body.get("toAccountId") != null ?
                    Long.parseLong(body.get("toAccountId").toString()) : null;

            return ResponseEntity.ok(transactionService.createTransaction(
                    userId, amount, type, description, note, date, accountId, categoryId, toAccountId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        try {
            Long userId = getUserId(userDetails);
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            Transaction.TransactionType type = Transaction.TransactionType.valueOf(body.get("type").toString());
            String description = (String) body.get("description");
            String note = (String) body.get("note");
            LocalDateTime date = body.get("transactionDate") != null ?
                    LocalDateTime.parse(body.get("transactionDate").toString()) : null;
            Long accountId = body.get("accountId") != null ?
                    Long.parseLong(body.get("accountId").toString()) : null;
            Long categoryId = body.get("categoryId") != null ?
                    Long.parseLong(body.get("categoryId").toString()) : null;

            return ResponseEntity.ok(transactionService.updateTransaction(
                    id, userId, amount, type, description, note, date, accountId, categoryId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            transactionService.deleteTransaction(id, getUserId(userDetails));
            return ResponseEntity.ok(Map.of("message", "Transaction deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.getDashboardSummary(getUserId(userDetails)));
    }
}
