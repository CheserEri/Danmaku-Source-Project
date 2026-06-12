package com.movie.file.controller;

import com.movie.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Tag(name = "文件接口")
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${file.base-url:http://localhost:8086}")
    private String baseUrl;

    @Operation(summary = "上传文件")
    @PostMapping("/upload")
    public Result<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return Result.error("文件不能为空");
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            // Build response
            Map<String, Object> result = new HashMap<>();
            result.put("filename", filename);
            result.put("originalFilename", originalFilename);
            result.put("url", baseUrl + "/api/files/" + filename);
            result.put("size", file.getSize());
            result.put("contentType", file.getContentType());

            return Result.success(result);
        } catch (IOException e) {
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    @Operation(summary = "获取文件")
    @GetMapping("/{filename}")
    public Result<Map<String, Object>> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            File file = filePath.toFile();

            if (!file.exists()) {
                return Result.error("文件不存在");
            }

            Map<String, Object> result = new HashMap<>();
            result.put("filename", filename);
            result.put("url", baseUrl + "/api/files/" + filename);
            result.put("size", file.length());

            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "删除文件")
    @DeleteMapping("/{filename}")
    public Result<Void> deleteFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            File file = filePath.toFile();

            if (!file.exists()) {
                return Result.error("文件不存在");
            }

            if (file.delete()) {
                return Result.success();
            } else {
                return Result.error("文件删除失败");
            }
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
