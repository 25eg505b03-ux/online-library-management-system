package com.openshelf.library.admin;

import com.openshelf.library.auth.AppUser;
import com.openshelf.library.auth.UserRepository;
import com.openshelf.library.borrowing.Borrowing;
import com.openshelf.library.borrowing.BorrowingRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository users;
    private final BorrowingRepository borrowings;
    public AdminController(UserRepository users, BorrowingRepository borrowings) { this.users = users; this.borrowings = borrowings; }

    @GetMapping("/members")
    public List<Map<String, Object>> members() {
        return users.findAll().stream().map(u -> Map.<String, Object>of(
            "id", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole(),
            "enabled", u.isEnabled(), "createdAt", u.getCreatedAt().toString())).toList();
    }
    @PatchMapping("/members/{id}/status")
    public Map<String, Object> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        AppUser u = users.findById(id).orElseThrow();
        if ("ADMIN".equals(u.getRole()) && Boolean.FALSE.equals(body.get("enabled")))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Cannot deactivate the administrator through this endpoint");
        u.setEnabled(Boolean.TRUE.equals(body.get("enabled")));
        users.save(u);
        return Map.of("id", u.getId(), "enabled", u.isEnabled());
    }
    @GetMapping("/borrowings")
    public List<Map<String, Object>> borrowingRecords() {
        return borrowings.findAll().stream().map(b -> Map.<String, Object>of(
            "id", b.getId(), "bookTitle", b.getBook().getTitle(), "memberName", b.getMember().getName(),
            "borrowDate", b.getBorrowDate().toString(), "dueDate", b.getDueDate().toString(), "status", b.getStatus())).toList();
    }
}