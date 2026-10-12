package com.openshelf.library;

import com.openshelf.library.auth.AppUser;
import com.openshelf.library.auth.UserRepository;
import com.openshelf.library.book.Book;
import com.openshelf.library.book.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class LibraryApplication {
    public static void main(String[] args) { SpringApplication.run(LibraryApplication.class, args); }

    @Bean
    CommandLineRunner seedData(BookRepository books, UserRepository users, PasswordEncoder encoder,
                               org.springframework.core.env.Environment env) {
        return args -> {
            if (books.count() == 0) {
                books.save(book("Atomic Habits", "James Clear", "Personal Growth", 2018, 5, "A practical guide to building good habits and breaking bad ones."));
                books.save(book("The Design of Everyday Things", "Don Norman", "Design", 2013, 3, "A classic exploration of human-centered design."));
                books.save(book("Clean Code", "Robert C. Martin", "Technology", 2008, 4, "Principles for writing readable, maintainable software."));
                books.save(book("Sapiens", "Yuval Noah Harari", "History", 2011, 4, "A sweeping account of the history of humankind."));
                books.save(book("Deep Work", "Cal Newport", "Personal Growth", 2016, 5, "Rules for focused success in a distracted world."));
                books.save(book("The Pragmatic Programmer", "David Thomas and Andrew Hunt", "Technology", 2019, 2, "Timeless advice for software developers."));
            }
            String adminEmail = env.getProperty("ADMIN_EMAIL", "admin@openshelf.local");
            String adminPassword = env.getProperty("ADMIN_PASSWORD", "ChangeMe123!");
            if (!users.existsByEmailIgnoreCase(adminEmail)) {
                AppUser admin = new AppUser();
                admin.setName("Library Administrator");
                admin.setEmail(adminEmail.toLowerCase());
                admin.setPassword(encoder.encode(adminPassword));
                admin.setRole("ADMIN");
                admin.setEnabled(true);
                users.save(admin);
            }
        };
    }

    private Book book(String title, String author, String category, int year, int copies, String description) {
        Book b = new Book();
        b.setTitle(title); b.setAuthor(author); b.setCategory(category);
        b.setPublicationYear(year); b.setTotalCopies(copies); b.setAvailableCopies(copies);
        b.setDescription(description);
        return b;
    }
}