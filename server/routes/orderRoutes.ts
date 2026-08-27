import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import {
  createOrder,
  getBuyerOrders,
  getBuyerOrderById,
  cancelBuyerOrder
} from '../services/orderService.ts';

const router = Router();

// Apply requireAuth for all order endpoints
router.use(requireAuth);

// POST /api/orders - Place a new order
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shippingAddress, paymentMethod, discountCode, notes } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'عنوان التوصيل والشحن إلزامي لإتمام الطلب',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'يرجى اختيار طريقة الدفع المناسبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const order = await createOrder(req.user!, {
      shippingAddress,
      paymentMethod,
      discountCode,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'تم تأكيد طلبك بنجاح وجاري إبلاغ ورش الصعيد لبدء التجهيز',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر إتمام الطلب',
      code: 'ORDER_CREATION_FAILED'
    });
  }
});

// GET /api/orders - List all orders of current buyer
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const orders = await getBuyerOrders(buyerId);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب قائمة طلباتك',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/orders/:id - Get order details with IDOR protection
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const orderId = req.params.id;

    const order = await getBuyerOrderById(buyerId, orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'الطلب غير موجود',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(403).json({
      success: false,
      error: (error as Error).message || 'غير مصرح بالاطلاع على هذا الطلب',
      code: 'FORBIDDEN'
    });
  }
});

// POST /api/orders/:id/cancel - Cancel pending order
router.post('/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const orderId = req.params.id;
    const { reason } = req.body;

    const cancelledOrder = await cancelBuyerOrder(buyerId, orderId, reason);

    res.json({
      success: true,
      message: 'تم إلغاء الطلب بنجاح واستعادة الكميات للورشة',
      data: cancelledOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر إلغاء الطلب',
      code: 'CANCELLATION_FAILED'
    });
  }
});

export default router;
