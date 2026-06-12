package com.movie.series.service;

import com.movie.series.entity.Episode;
import com.movie.series.entity.Series;
import com.movie.series.entity.SeriesCast;
import com.movie.series.entity.SeriesCastId;
import com.movie.series.repository.EpisodeRepository;
import com.movie.series.repository.SeriesCastRepository;
import com.movie.series.repository.SeriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 影视服务业务逻辑层
 * 
 * 负责处理影视剧、剧集、演职人员的核心业务逻辑。
 * 包括 CRUD 操作、分类筛选、热门推荐等功能。
 * 
 * 主要职责:
 * 1. 影视剧的增删改查
 * 2. 剧集管理
 * 3. 演职人员管理
 * 4. 分类筛选和排序
 * 
 * 使用 @Service 注解标记为 Spring 服务组件
 * 使用 @RequiredArgsConstructor 自动注入依赖
 */
@Service
@RequiredArgsConstructor
public class SeriesService {

    /**
     * 影视剧数据访问层
     * 提供影视剧的数据库操作方法
     */
    private final SeriesRepository seriesRepository;

    /**
     * 剧集数据访问层
     * 提供剧集的数据库操作方法
     */
    private final EpisodeRepository episodeRepository;

    /**
     * 演职人员数据访问层
     * 提供演职人员的数据库操作方法
     */
    private final SeriesCastRepository seriesCastRepository;

    /**
     * 搜索影视剧
     * 
     * 根据关键词搜索影视剧，支持标题和原始标题的模糊匹配。
     * 
     * @param keyword 搜索关键词
     * @return 匹配的影视剧列表
     * 
     * 示例:
     * List<Series> results = seriesService.search("三体");
     */
    public List<Series> search(String keyword) {
        return seriesRepository.searchByKeyword(keyword);
    }

    /**
     * 根据ID获取影视剧详情
     * 
     * @param id 影视剧ID
     * @return 影视剧实体
     * @throws RuntimeException 如果影视剧不存在
     * 
     * 示例:
     * Series series = seriesService.getById(1L);
     */
    public Series getById(Long id) {
        return seriesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Series not found: " + id));
    }

    /**
     * 获取热门影视剧
     * 
     * 按热度降序返回前10部影视剧。
     * 热度基于用户访问量、评分等因素计算。
     * 
     * @return 热门影视剧列表（最多10部）
     */
    public List<Series> getTrending() {
        return seriesRepository.findTop10ByOrderByPopularityDesc();
    }

    /**
     * 获取最新影视剧
     * 
     * 按创建时间降序返回前10部影视剧。
     * 
     * @return 最新影视剧列表（最多10部）
     */
    public List<Series> getLatest() {
        return seriesRepository.findTop10ByOrderByCreatedAtDesc();
    }

    /**
     * 创建影视剧
     * 
     * @param series 影视剧实体
     * @return 保存后的影视剧（包含生成的ID）
     * 
     * 使用 @Transactional 注解确保事务一致性
     */
    @Transactional
    public Series create(Series series) {
        return seriesRepository.save(series);
    }

    /**
     * 更新影视剧
     * 
     * 只更新传入的非空字段，实现部分更新。
     * 
     * @param id 影视剧ID
     * @param updateData 更新数据（只更新非空字段）
     * @return 更新后的影视剧
     * @throws RuntimeException 如果影视剧不存在
     * 
     * 示例:
     * Series updateData = new Series();
     * updateData.setTitle("新标题");
     * updateData.setRating(9.0);
     * Series updated = seriesService.update(1L, updateData);
     */
    @Transactional
    public Series update(Long id, Series updateData) {
        // 先查询原数据
        Series series = getById(id);
        
        // 只更新非空字段
        if (updateData.getTitle() != null) series.setTitle(updateData.getTitle());
        if (updateData.getOriginalTitle() != null) series.setOriginalTitle(updateData.getOriginalTitle());
        if (updateData.getDescription() != null) series.setDescription(updateData.getDescription());
        if (updateData.getCoverUrl() != null) series.setCoverUrl(updateData.getCoverUrl());
        if (updateData.getBackdropUrl() != null) series.setBackdropUrl(updateData.getBackdropUrl());
        if (updateData.getSeriesType() != null) series.setSeriesType(updateData.getSeriesType());
        if (updateData.getGenres() != null) series.setGenres(updateData.getGenres());
        if (updateData.getCountry() != null) series.setCountry(updateData.getCountry());
        if (updateData.getLanguage() != null) series.setLanguage(updateData.getLanguage());
        if (updateData.getReleaseDate() != null) series.setReleaseDate(updateData.getReleaseDate());
        if (updateData.getYear() != null) series.setYear(updateData.getYear());
        if (updateData.getStatus() != null) series.setStatus(updateData.getStatus());
        if (updateData.getRating() != null) series.setRating(updateData.getRating());
        if (updateData.getTags() != null) series.setTags(updateData.getTags());

        return seriesRepository.save(series);
    }

    /**
     * 删除影视剧
     * 
     * @param id 影视剧ID
     * 
     * 注意: 删除影视剧会级联删除相关的剧集、演职人员等数据
     */
    @Transactional
    public void delete(Long id) {
        seriesRepository.deleteById(id);
    }

    /**
     * 获取影视剧的剧集列表
     * 
     * 按季数和集数升序排列。
     * 
     * @param seriesId 影视剧ID
     * @return 剧集列表
     */
    public List<Episode> getEpisodes(Long seriesId) {
        return episodeRepository.findBySeriesIdOrderBySeasonNumberAscEpisodeNumberAsc(seriesId);
    }

    /**
     * 根据ID获取剧集详情
     * 
     * @param episodeId 剧集ID
     * @return 剧集实体
     * @throws RuntimeException 如果剧集不存在
     */
    public Episode getEpisode(Long episodeId) {
        return episodeRepository.findById(episodeId)
            .orElseThrow(() -> new RuntimeException("Episode not found: " + episodeId));
    }

    /**
     * 创建剧集
     * 
     * @param seriesId 影视剧ID
     * @param episode 剧集实体
     * @return 保存后的剧集
     */
    @Transactional
    public Episode createEpisode(Long seriesId, Episode episode) {
        episode.setSeriesId(seriesId);
        return episodeRepository.save(episode);
    }

    /**
     * 获取影视剧的演职人员列表
     * 
     * @param seriesId 影视剧ID
     * @return 演职人员列表
     */
    public List<SeriesCast> getCast(Long seriesId) {
        return seriesCastRepository.findByIdSeriesId(seriesId);
    }

    /**
     * 添加演职人员
     * 
     * @param seriesId 影视剧ID
     * @param cast 演职人员实体
     * @return 保存后的演职人员
     */
    @Transactional
    public SeriesCast addCast(Long seriesId, SeriesCast cast) {
        // 创建复合主键
        SeriesCastId id = new SeriesCastId();
        id.setSeriesId(seriesId);
        id.setPersonId(cast.getId().getPersonId());
        id.setCastType(cast.getId().getCastType());
        cast.setId(id);
        return seriesCastRepository.save(cast);
    }

    /**
     * 按分类获取影视剧列表
     * 
     * @param category 分类代码（ANIME/MOVIE/MUSIC/VARIETY/DOCUMENTARY）
     * @return 该分类的影视剧列表
     * 
     * 示例:
     * List<Series> animeList = seriesService.getByCategory("ANIME");
     */
    public List<Series> getByCategory(String category) {
        return seriesRepository.findBySeriesType(category.toUpperCase());
    }

    /**
     * 获取分类热门影视剧
     * 
     * @param category 分类代码
     * @return 该分类的热门影视剧列表
     */
    public List<Series> getTrendingByCategory(String category) {
        return seriesRepository.findBySeriesTypeOrderByPopularityDesc(category.toUpperCase());
    }

    /**
     * 获取分类最新影视剧
     * 
     * @param category 分类代码
     * @return 该分类的最新影视剧列表
     */
    public List<Series> getLatestByCategory(String category) {
        return seriesRepository.findBySeriesTypeOrderByCreatedAtDesc(category.toUpperCase());
    }
}
