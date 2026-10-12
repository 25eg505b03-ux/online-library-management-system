package com.openshelf.library.borrowing;

import com.openshelf.library.auth.AppUser;
import com.openshelf.library.auth.UserRepository;
import com.openshelf.library.book.Book;
import com.openshelf.library.book.BookRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrowings")
public class BorrowingController {
    private final BorrowingRepository borrowings;
    private final UserRepository users;
    private final BookRepository books;

    public BorrowingController(BorrowingRepository borrowings, UserRepository users, BookRepository books) {
        this.borrowings = borrowings; this.users = users; this.books = books;
    }

    @GetMapping("/my")
    public List<Map<String, Object>> mine(Authentication auth) {
        AppUser member = currentUser(auth);
        return borrowings.findByMemberIdOrderByBorrowDateDesc(member.getId()).stream().map(this::view).toList();
    }

    @PostMapping("/{bookId}") @ResponseStatus(HttpStatus.CREATED) @Transactional
    public Map<String, Object> borrow(@PathVariable Long bookId, Authentication auth) {
        AppUser member = currentUser(auth);
        Book book = books.findById(bookId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        if (book.getAvailableCopies() < 1) throw new ResponseStatusException(HttpStatus.CONFLICT, "No copies are currently available");
        if (borrowings.existsByMemberIdAndBookIdAndStatus(member.getId(), bookId, "BORROWED"))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have this book borrowed");
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        books.save(book);
        Borrowing borrowing = new Borrowing(); borrowing.setMember(member); borrowing.setBook(book);
        borrowing.setBorrowDate(LocalDate.now()); borrowing.setDueDate(LocalDate.now().plusDays(14)); borrowing.setStatus("BORROWED");
        return view(borrowings.save(borrowing));
    }

    @PostMapping("/{id}/return") @Transactional
    public Map<String, Object> returnBook(@PathVariable Long id, Authentication auth) {
        AppUser member = currentUser(auth);
        Borrowing b = borrowings.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrowing record not found"));
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && !b.getMember().getId().equals(member.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        if (!"BORROWED".equals(b.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "This book is not currently borrowed");
        b.setStatus("RETURNED"); b.setReturnDate(LocalDate.now());
        Book book = b.getBook(); book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1)); books.save(book);
        return view(borrowings.save(b));
    }

    @GetMapping @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> all() { return borrowings.findAll().stream().map(this::view).toList(); }

    private AppUser currentUser(Authentication auth) {
        return users.findByEmailIgnoreCase(auth.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
    private Map<String, Object> view(Borrowing b) {
        return Map.of("id", b.getId(), "bookId", b.getBook().getId(), "bookTitle", b.getBook().getTitle(),
            "book", Map.of("id", b.getBook().getId(), "title", b.getBook().getTitle()),
            "memberId", b.getMember().getId(), "memberName", b.getMember().getName(),
            "borrowDate", b.getBorrowDate().toString(), "dueDate", b.getDueDate().toString(),
            "returnDate", b.getReturnDate() == null ? "" : b.getReturnDate().toString(), "status", b.getStatus());
    }
}