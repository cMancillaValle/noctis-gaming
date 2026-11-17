package com.noctis.productos.service;

import com.noctis.productos.dto.ActualizarPrecioDTO;
import com.noctis.productos.dto.ProductoRequestDTO;
import com.noctis.productos.dto.ProductoResponseDTO;
import com.noctis.productos.dto.ProductoUpdateDTO;
import com.noctis.productos.exception.ResourceNotFoundException;
import com.noctis.productos.model.Producto;
import com.noctis.productos.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarProductos(String categoria, String busqueda) {
        List<Producto> productos;
        if (categoria != null && !categoria.isBlank()) {
            productos = productoRepository.findByCategoriaAndActivoTrue(categoria.trim());
        } else if (busqueda != null && !busqueda.isBlank()) {
            productos = productoRepository.findByNombreContainingIgnoreCaseAndActivoTrue(busqueda.trim());
        } else {
            productos = productoRepository.findByActivoTrue();
        }

        return productos.stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarTodosAdmin() {
        return productoRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponseDTO buscarPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        return mapToDTO(producto);
    }

    @Transactional
    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto) {
        Producto producto = new Producto();
        producto.setNombre(dto.nombre().trim());
        producto.setDescripcion(dto.descripcion().trim());
        producto.setPrecio(dto.precio());
        producto.setCategoria(dto.categoria().trim());
        producto.setImagenUrl(dto.imagenUrl() != null ? dto.imagenUrl().trim() : null);
        producto.setActivo(true);

        Producto guardado = productoRepository.save(producto);
        return mapToDTO(guardado);
    }

    @Transactional
    public ProductoResponseDTO actualizarPrecio(Long id, ActualizarPrecioDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        producto.setPrecio(dto.nuevoPrecio());
        Producto actualizado = productoRepository.save(producto);
        return mapToDTO(actualizado);
    }

    @Transactional
    public ProductoResponseDTO actualizarProductoCompleto(Long id, ProductoUpdateDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        producto.setNombre(dto.nombre().trim());
        producto.setDescripcion(dto.descripcion().trim());
        producto.setPrecio(dto.precio());
        producto.setCategoria(dto.categoria().trim());
        if (dto.imagenUrl() != null) {
            producto.setImagenUrl(dto.imagenUrl().trim());
        }
        if (dto.activo() != null) {
            producto.setActivo(dto.activo());
        }

        Producto actualizado = productoRepository.save(producto);
        return mapToDTO(actualizado);
    }

    @Transactional(readOnly = true)
    public List<String> obtenerCategorias() {
        return productoRepository.findDistinctCategorias();
    }

    public ProductoResponseDTO mapToDTO(Producto p) {
        return new ProductoResponseDTO(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getPrecio(),
                p.getCategoria(),
                p.getImagenUrl(),
                p.isActivo(),
                p.getFechaCreacion()
        );
    }
}
