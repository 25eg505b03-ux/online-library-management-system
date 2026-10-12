package com.openshelf.library.book;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookRepository books;
    public BookController(BookRepository books) { this.books = books; }

    public record BookRequest(@NotBlank @Size(max=220) String title,
                              @NotBlank @Size(max=180) String author,
                              @Size(max=100) String category,
                              Integer publicationYear,
                              @Min(1) Integer totalCopies,
                              @Min(0) Integer availableCopies,
                              @Size(max=3000) String description,
                              @Size(max=1000) String coverUrl) {}

    @GetMapping public List<Book> all(@RequestParam(required=false) String q) {
        return q == null || q.isBlank() ? books.findAll() : books.search(q.trim());
    }
    @GetMapping("/{id}") public Book one(@PathVariable Long id) { return find(id); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')")
    public Book create(@Valid @RequestBody BookRequest request) {
        Book b = new Book(); apply(b, request); return books.save(b);
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public Book update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        Book b = find(id); apply(b, request); return books.save(b);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { books.delete(find(id)); }

    private Book find(Long id) { return books.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found")); }
    private void apply(Book b, BookRequest r) {
        int total = r.totalCopies() == null ? 1 : r.totalCopies();
        int available = r.availableCopies() == null ? total : r.availableCopies();
        if (total < 1 || available < 0 || available > total) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Available copies must be between zero and total copies");
        b.setTitle(r.title().trim()); b.setAuthor(r.author().trim());
        b.setCategory(r.category() == null || r.category().isBlank() ? "General" : r.category().trim());
        b.setPublicationYear(r.publicationYear()); b.setTotalCopies(total); b.setAvailableCopies(available);
        b.setDescription(r.description()); b.setCoverUrl(r.coverUrl());
    }
}