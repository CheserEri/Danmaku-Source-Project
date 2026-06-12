package com.movie.series.service;

import com.movie.series.dto.CategoryTheme;
import com.movie.series.repository.SeriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final SeriesRepository seriesRepository;

    public List<CategoryTheme> getAllCategories() {
        CategoryTheme[] themes = CategoryTheme.getDefaultThemes();
        
        // Get count for each category
        Map<String, Long> countMap = Arrays.stream(themes)
            .collect(Collectors.toMap(
                CategoryTheme::getCode,
                theme -> seriesRepository.countBySeriesType(theme.getCode())
            ));

        return Arrays.stream(themes)
            .peek(theme -> theme.setCount(countMap.getOrDefault(theme.getCode(), 0L)))
            .collect(Collectors.toList());
    }

    public CategoryTheme getCategoryTheme(String type) {
        return Arrays.stream(CategoryTheme.getDefaultThemes())
            .filter(theme -> theme.getCode().equalsIgnoreCase(type))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Unknown category: " + type));
    }
}
